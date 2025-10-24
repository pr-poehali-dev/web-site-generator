'''
Business: Публикация и просмотр созданных веб-сайтов
Args: event с httpMethod, body (POST), path parameters (GET)
Returns: HTTP response с сохраненным ID или HTML контентом сайта
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        headers = event.get('headers', {})
        
        site_id = body_data.get('id')
        user_email = headers.get('x-user-email', headers.get('X-User-Email', 'anonymous'))
        project_name = body_data.get('name', 'Unnamed Project')
        html_content = body_data.get('html', '')
        css_content = body_data.get('css', '')
        js_content = body_data.get('js', '')
        
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO published_sites (id, user_email, project_name, html_content, css_content, js_content, views)
            VALUES (%s, %s, %s, %s, %s, %s, 0)
            ON CONFLICT (id) 
            DO UPDATE SET 
                html_content = EXCLUDED.html_content,
                css_content = EXCLUDED.css_content,
                js_content = EXCLUDED.js_content,
                project_name = EXCLUDED.project_name,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
            """,
            (site_id, user_email, project_name, html_content, css_content, js_content)
        )
        result = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': result[0], 'message': 'Site published successfully'})
        }
    
    if method == 'GET':
        path_params = event.get('pathParams', {})
        site_id = path_params.get('id')
        
        if not site_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'},
                'body': '<h1>400 | ID не указан</h1>'
            }
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT html_content, css_content, js_content, project_name, views FROM published_sites WHERE id = %s",
            (site_id,)
        )
        site = cursor.fetchone()
        
        if not site:
            cursor.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'},
                'body': '<h1>404 | Сайт не найден</h1><p>Этот сайт не опубликован или был удален</p>'
            }
        
        cursor.execute("UPDATE published_sites SET views = views + 1 WHERE id = %s", (site_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        html_page = f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{site['project_name']}</title>
    <style>{site['css_content']}</style>
</head>
<body>
    {site['html_content']}
    <script>{site['js_content']}</script>
</body>
</html>"""
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'},
            'body': html_page
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
