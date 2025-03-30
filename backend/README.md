# Router Controller Backend

This is the Django backend for the Router Controller application. It provides a RESTful API for managing and monitoring network routers.

## Setup Instructions

### Prerequisites

- Python 3.10 or later
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
   ```
   cd /path/to/RouterController/backend
   ```

2. Activate the virtual environment:
   ```
   source backend_env/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Apply migrations:
   ```
   cd controller
   python manage.py migrate
   ```

5. Create a superuser (for admin access):
   ```
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration

### Router Credentials

- `GET /api/routers/` - List all router credentials for the authenticated user
- `POST /api/routers/` - Add a new router credential
- `GET /api/routers/{id}/` - Get details for a specific router credential
- `PUT /api/routers/{id}/` - Update a router credential
- `DELETE /api/routers/{id}/` - Delete a router credential

### Router Control

- `GET /api/router-details/` - Get router details
- `GET /api/router-uptime/` - Get router uptime
- `GET /api/router-control/?operation=wan-connection-status` - Get WAN connection status
- `GET /api/router-control/?operation=internet-link-status` - Check internet link status
- `GET /api/router-control/?operation=wireless-connected-devices` - Get connected wireless devices

### User Settings

- `GET /api/user-settings/` - Get user settings
- `PUT /api/user-settings/` - Update user settings

## Models

### RouterCredential

Stores router credentials for users:

- `user` - ForeignKey to User model
- `router_name` - Friendly name for the router
- `router_url` - Router IP address or URL
- `username` - Router admin username
- `password` - Router admin password
- `is_default` - Whether this is the default router for the user

### UserSetting

Stores user settings and preferences:

- `user` - OneToOneField to User model
- `theme` - User interface theme preference
- `dashboard_layout` - JSON field for dashboard widget layout preferences

## Development

### Adding New Router Features

To add support for additional router features:

1. Add the necessary methods to the `TPLinkClient` class in `views.py`
2. Create a new endpoint in `urls.py`
3. Implement the corresponding view class

### Testing

Run tests with:
```
python manage.py test
```