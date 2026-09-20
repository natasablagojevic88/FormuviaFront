 export class ApiRoute{
    static readonly login='/api/login';
    static readonly logout='/api/login/logout';
    static readonly session='/api/session';
    static readonly changePassword='/api/session/change-password';
    static readonly appuser='/api/appuser';
    static readonly appuserTable='/api/appuser/table';
    static readonly appuserAllRoles='/api/appuser/all-roles';
    static readonly role='/api/role';
    static readonly roleTable='/api/role/table';
    static readonly exportTable='/api/export-table';

    static appuserId(id: string): string {
        return `/api/appuser/${id}`;
    }

    static roleId(id: string): string {
        return `/api/role/${id}`;
    }

    static history(className: string, id: string): string {
        return `/api/history/${className}/${id}`;
    }
}