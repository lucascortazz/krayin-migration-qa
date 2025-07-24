"""
Migration tracker server - provides real-time tracking interface
"""
import asyncio
import json
import os
from datetime import datetime
from pathlib import Path
from aiohttp import web, WSMsgType
import aiohttp_cors
import websockets
from websocket_handler import WebSocketHandler
from migration_log import MigrationLogger

class TrackerServer:
    """Migration tracking server with WebSocket support"""
    
    def __init__(self, host='localhost', port=8080, ws_port=8081):
        self.host = host
        self.port = port
        self.ws_port = ws_port
        self.app = web.Application()
        self.ws_handler = WebSocketHandler()
        self.logger = MigrationLogger()
        self.setup_routes()
        self.setup_cors()
        
    def setup_routes(self):
        """Setup HTTP routes"""
        self.app.router.add_get('/', self.serve_dashboard)
        self.app.router.add_get('/api/status', self.get_migration_status)
        self.app.router.add_get('/api/components', self.get_components)
        self.app.router.add_get('/api/component/{name}', self.get_component_detail)
        self.app.router.add_post('/api/component/{name}/update', self.update_component)
        self.app.router.add_get('/api/logs', self.get_logs)
        self.app.router.add_get('/api/reports', self.get_reports)
        
        # Static files
        self.app.router.add_static('/', path='../static', name='static')
        self.app.router.add_static('/templates', path='../templates', name='templates')
    
    def setup_cors(self):
        """Setup CORS for cross-origin requests"""
        cors = aiohttp_cors.setup(self.app, defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*"
            )
        })
        
        # Add CORS to all routes
        for route in list(self.app.router.routes()):
            cors.add(route)
    
    async def serve_dashboard(self, request):
        """Serve the main dashboard"""
        dashboard_path = Path('../templates/dashboard/migration_overview.html')
        if dashboard_path.exists():
            with open(dashboard_path, 'r') as f:
                content = f.read()
            return web.Response(text=content, content_type='text/html')
        else:
            return web.Response(text="Dashboard not found", status=404)
    
    async def get_migration_status(self, request):
        """Get overall migration status"""
        try:
            # Load component mapping
            config_path = Path('../../config/component_mapping.json')
            with open(config_path, 'r') as f:
                components = json.load(f)
            
            # Calculate overall progress
            total_components = len(components.get('components', {}))
            completed_count = sum(
                1 for comp in components.get('components', {}).values()
                if comp.get('status') == 'completed'
            )
            in_progress_count = sum(
                1 for comp in components.get('components', {}).values()
                if comp.get('status') == 'in_progress'
            )
            
            overall_progress = (completed_count / total_components * 100) if total_components > 0 else 0
            
            status = {
                'overall_progress': round(overall_progress, 2),
                'total_components': total_components,
                'completed_components': completed_count,
                'in_progress_components': in_progress_count,
                'pending_components': total_components - completed_count - in_progress_count,
                'last_updated': datetime.now().isoformat()
            }
            
            return web.json_response(status)
            
        except Exception as e:
            return web.json_response({'error': str(e)}, status=500)
    
    async def get_components(self, request):
        """Get list of all components"""
        try:
            config_path = Path('../../config/component_mapping.json')
            with open(config_path, 'r') as f:
                data = json.load(f)
            
            components_list = []
            for name, details in data.get('components', {}).items():
                components_list.append({
                    'name': name,
                    'status': details.get('status', 'pending'),
                    'priority': details.get('priority', 'medium'),
                    'estimated_effort': details.get('estimated_effort', 'Unknown')
                })
            
            return web.json_response({'components': components_list})
            
        except Exception as e:
            return web.json_response({'error': str(e)}, status=500)
    
    async def get_component_detail(self, request):
        """Get detailed information about a specific component"""
        component_name = request.match_info['name']
        
        try:
            config_path = Path('../../config/component_mapping.json')
            with open(config_path, 'r') as f:
                data = json.load(f)
            
            component = data.get('components', {}).get(component_name)
            if not component:
                return web.json_response({'error': 'Component not found'}, status=404)
            
            # Add tracking data if available
            tracking_file = Path(f'../../reports/migration-progress/{component_name}.json')
            if tracking_file.exists():
                with open(tracking_file, 'r') as f:
                    tracking_data = json.load(f)
                component['tracking'] = tracking_data
            
            return web.json_response(component)
            
        except Exception as e:
            return web.json_response({'error': str(e)}, status=500)
    
    async def update_component(self, request):
        """Update component status"""
        component_name = request.match_info['name']
        
        try:
            data = await request.json()
            
            # Log the update
            self.logger.log_component_update(
                component_name,
                data.get('status'),
                data.get('progress', 0),
                data.get('notes', '')
            )
            
            # Update component mapping file
            config_path = Path('../../config/component_mapping.json')
            with open(config_path, 'r') as f:
                config_data = json.load(f)
            
            if component_name in config_data.get('components', {}):
                config_data['components'][component_name].update(data)
                
                with open(config_path, 'w') as f:
                    json.dump(config_data, f, indent=2)
                
                # Notify WebSocket clients
                await self.ws_handler.broadcast_update({
                    'type': 'component_update',
                    'component': component_name,
                    'data': data
                })
                
                return web.json_response({'success': True})
            else:
                return web.json_response({'error': 'Component not found'}, status=404)
                
        except Exception as e:
            return web.json_response({'error': str(e)}, status=500)
    
    async def get_logs(self, request):
        """Get migration logs"""
        try:
            logs = self.logger.get_recent_logs(limit=100)
            return web.json_response({'logs': logs})
        except Exception as e:
            return web.json_response({'error': str(e)}, status=500)
    
    async def get_reports(self, request):
        """Get available reports"""
        try:
            reports_dir = Path('../../reports')
            reports = []
            
            for report_type in ['test-results', 'migration-progress', 'performance-comparison', 'security-analysis']:
                report_path = reports_dir / report_type
                if report_path.exists():
                    for file in report_path.glob('*.json'):
                        reports.append({
                            'name': file.stem,
                            'type': report_type,
                            'created': datetime.fromtimestamp(file.stat().st_mtime).isoformat(),
                            'size': file.stat().st_size
                        })
            
            return web.json_response({'reports': reports})
            
        except Exception as e:
            return web.json_response({'error': str(e)}, status=500)
    
    async def start_websocket_server(self):
        """Start WebSocket server for real-time updates"""
        await self.ws_handler.start_server(self.host, self.ws_port)
    
    async def start_server(self):
        """Start the HTTP server"""
        print(f"Starting migration tracker server on http://{self.host}:{self.port}")
        print(f"WebSocket server will run on ws://{self.host}:{self.ws_port}")
        
        # Start WebSocket server
        asyncio.create_task(self.start_websocket_server())
        
        # Start HTTP server
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, self.host, self.port)
        await site.start()
        
        print("🚀 Migration tracker is running!")
        print(f"📊 Dashboard: http://{self.host}:{self.port}")
        print(f"🔌 WebSocket: ws://{self.host}:{self.ws_port}")
        
        # Keep server running
        try:
            await asyncio.Future()  # Run forever
        except KeyboardInterrupt:
            print("Shutting down migration tracker...")
            await runner.cleanup()

if __name__ == '__main__':
    server = TrackerServer()
    asyncio.run(server.start_server())
