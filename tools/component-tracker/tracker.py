"""
Migration component tracker - tracks the status of component migration
"""
import json
import time
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path
import websockets
import asyncio
from .status_manager import StatusManager
from .notification_system import NotificationSystem

class ComponentTracker:
    """Tracks migration progress for individual components"""
    
    def __init__(self, config_path: str = "config/component_mapping.json"):
        self.config_path = Path(config_path)
        self.status_manager = StatusManager()
        self.notification_system = NotificationSystem()
        self.components = self._load_components()
        self.tracking_data = {}
        
    def _load_components(self) -> Dict[str, Any]:
        """Load component mapping configuration"""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Configuration file not found: {self.config_path}")
            return {"components": {}}
    
    def start_tracking(self, component_name: str):
        """Start tracking a component migration"""
        if component_name not in self.components["components"]:
            raise ValueError(f"Component '{component_name}' not found in configuration")
        
        self.tracking_data[component_name] = {
            "status": "in_progress",
            "start_time": datetime.now().isoformat(),
            "progress": 0,
            "current_phase": "initialization",
            "issues": [],
            "completed_tasks": [],
            "remaining_tasks": self._get_component_tasks(component_name)
        }
        
        self.status_manager.update_status(component_name, "in_progress")
        self.notification_system.notify_start(component_name)
        
        print(f"Started tracking component: {component_name}")
    
    def update_progress(self, component_name: str, progress: int, phase: str = None):
        """Update component migration progress"""
        if component_name not in self.tracking_data:
            raise ValueError(f"Component '{component_name}' is not being tracked")
        
        self.tracking_data[component_name]["progress"] = progress
        self.tracking_data[component_name]["last_updated"] = datetime.now().isoformat()
        
        if phase:
            self.tracking_data[component_name]["current_phase"] = phase
        
        self.status_manager.update_progress(component_name, progress)
        
        # Notify on significant progress milestones
        if progress in [25, 50, 75, 100]:
            self.notification_system.notify_milestone(component_name, progress)
        
        print(f"Updated {component_name}: {progress}% complete")
    
    def mark_task_completed(self, component_name: str, task: str):
        """Mark a specific task as completed"""
        if component_name not in self.tracking_data:
            raise ValueError(f"Component '{component_name}' is not being tracked")
        
        tracking = self.tracking_data[component_name]
        
        if task in tracking["remaining_tasks"]:
            tracking["remaining_tasks"].remove(task)
            tracking["completed_tasks"].append({
                "task": task,
                "completed_at": datetime.now().isoformat()
            })
            
            # Calculate progress based on completed tasks
            total_tasks = len(tracking["completed_tasks"]) + len(tracking["remaining_tasks"])
            progress = int((len(tracking["completed_tasks"]) / total_tasks) * 100)
            self.update_progress(component_name, progress)
    
    def add_issue(self, component_name: str, issue: str, severity: str = "medium"):
        """Add an issue to component tracking"""
        if component_name not in self.tracking_data:
            raise ValueError(f"Component '{component_name}' is not being tracked")
        
        issue_data = {
            "description": issue,
            "severity": severity,
            "timestamp": datetime.now().isoformat(),
            "resolved": False
        }
        
        self.tracking_data[component_name]["issues"].append(issue_data)
        self.notification_system.notify_issue(component_name, issue, severity)
        
        print(f"Added issue to {component_name}: {issue}")
    
    def resolve_issue(self, component_name: str, issue_index: int):
        """Mark an issue as resolved"""
        if component_name not in self.tracking_data:
            raise ValueError(f"Component '{component_name}' is not being tracked")
        
        issues = self.tracking_data[component_name]["issues"]
        if 0 <= issue_index < len(issues):
            issues[issue_index]["resolved"] = True
            issues[issue_index]["resolved_at"] = datetime.now().isoformat()
            print(f"Resolved issue #{issue_index} for {component_name}")
    
    def complete_component(self, component_name: str):
        """Mark component migration as completed"""
        if component_name not in self.tracking_data:
            raise ValueError(f"Component '{component_name}' is not being tracked")
        
        self.tracking_data[component_name].update({
            "status": "completed",
            "progress": 100,
            "completion_time": datetime.now().isoformat(),
            "current_phase": "completed"
        })
        
        self.status_manager.update_status(component_name, "completed")
        self.notification_system.notify_completion(component_name)
        
        print(f"Component migration completed: {component_name}")
    
    def get_component_status(self, component_name: str) -> Dict[str, Any]:
        """Get current status of a component"""
        if component_name not in self.tracking_data:
            return {"error": f"Component '{component_name}' is not being tracked"}
        
        return self.tracking_data[component_name]
    
    def get_overall_progress(self) -> Dict[str, Any]:
        """Get overall migration progress"""
        total_components = len(self.components["components"])
        completed_components = sum(
            1 for data in self.tracking_data.values() 
            if data["status"] == "completed"
        )
        in_progress_components = sum(
            1 for data in self.tracking_data.values() 
            if data["status"] == "in_progress"
        )
        
        overall_progress = 0
        if total_components > 0:
            progress_sum = sum(data["progress"] for data in self.tracking_data.values())
            overall_progress = progress_sum / total_components
        
        return {
            "total_components": total_components,
            "completed_components": completed_components,
            "in_progress_components": in_progress_components,
            "overall_progress": round(overall_progress, 2),
            "components": self.tracking_data
        }
    
    def _get_component_tasks(self, component_name: str) -> List[str]:
        """Get list of tasks for a component"""
        component = self.components["components"].get(component_name, {})
        tasks = []
        
        # Generate tasks based on component structure
        if "laravel" in component:
            laravel_parts = component["laravel"]
            if "controller" in laravel_parts:
                tasks.append(f"Migrate controller: {laravel_parts['controller']}")
            if "model" in laravel_parts:
                tasks.append(f"Migrate model: {laravel_parts['model']}")
            if "views" in laravel_parts:
                tasks.extend([f"Migrate view: {view}" for view in laravel_parts["views"]])
            if "routes" in laravel_parts:
                tasks.append("Migrate routes")
        
        if "django" in component:
            tasks.append("Create Django implementation")
            tasks.append("Test functionality")
            tasks.append("Validate parity")
        
        return tasks
    
    async def start_websocket_server(self, host: str = "localhost", port: int = 8081):
        """Start WebSocket server for real-time updates"""
        async def handle_client(websocket, path):
            try:
                await websocket.send(json.dumps(self.get_overall_progress()))
                
                while True:
                    # Send updates every 5 seconds
                    await asyncio.sleep(5)
                    await websocket.send(json.dumps(self.get_overall_progress()))
                    
            except websockets.exceptions.ConnectionClosed:
                pass
        
        print(f"Starting WebSocket server on {host}:{port}")
        await websockets.serve(handle_client, host, port)
    
    def export_report(self, output_path: str = "reports/migration-progress/component_status.json"):
        """Export current tracking data to a report"""
        report_data = {
            "generated_at": datetime.now().isoformat(),
            "overall_progress": self.get_overall_progress(),
            "detailed_status": self.tracking_data
        }
        
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"Report exported to: {output_file}")


if __name__ == "__main__":
    # Example usage
    tracker = ComponentTracker()
    
    # Start tracking authentication component
    tracker.start_tracking("authentication")
    tracker.update_progress("authentication", 25, "migration_started")
    tracker.mark_task_completed("authentication", "Migrate controller: AuthController")
    tracker.add_issue("authentication", "Session timeout configuration needs adjustment", "low")
    
    # Export report
    tracker.export_report()
    
    print("Component tracking example completed")
