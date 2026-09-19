 export class ApiRoute{
    static readonly login='/api/login';
    static readonly logout='/api/login/logout';
    static readonly session='/api/session';
    static readonly changePassword='/api/session/change-password';
    static readonly translations='/api/translations';
    static readonly appuser='/api/appuser';
    static readonly appuserTable='/api/appuser/table';

    static appuserId(id: string): string {
        return `/api/appuser/${id}`;
    }
}