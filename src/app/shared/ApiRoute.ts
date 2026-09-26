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

    static readonly model='/api/model';
    static readonly modelTree='/api/model/tree';

    static readonly modelColumn='/api/model-column';

    static modelColumnList(modelId: string): string {
        return `/api/model-column/list/${modelId}`;
    }

    static modelColumnId(id: string): string {
        return `/api/model-column/${id}`;
    }

    static modelPreviewTable(modelId: string): string {
        return `/api/preview/model/${modelId}`;
    }

    /** Tabela podredjenog modela: samo redovi koji pripadaju redu nadredjene tabele. */
    static modelPreviewTableWithParent(modelId: string, parentId: string): string {
        return `/api/preview/model/${modelId}/${parentId}`;
    }

    /** Forma za nov zapis. */
    static modelPreviewForm(modelId: string): string {
        return `/api/preview/form/${modelId}`;
    }

    /** Forma postojeceg zapisa (izmena). */
    static modelPreviewFormWithId(modelId: string, id: string): string {
        return `/api/preview/form/${modelId}/${id}`;
    }

    /** Forma za nov zapis u podtabeli: prazna forma sa vezom na red nadredjene tabele. */
    static modelPreviewFormWithParent(modelId: string, parent: string): string {
        return `/api/preview/form/${modelId}/parent/${parent}`;
    }

    /** Istorija zapisa tabele iz modela (nema className kao ugradjene tabele). */
    static modelPreviewHistory(modelId: string, id: string): string {
        return `/api/preview/history/${modelId}/${id}`;
    }

    /** Brisanje zapisa tabele iz modela; redovi podtabela idu sa njim (cascade). */
    static modelPreviewDelete(modelId: string, id: string): string {
        return `/api/preview/delete/${modelId}/${id}`;
    }

    /** Snimanje zapisa tabele iz modela (insert kad je id prazan, inace update). */
    static modelPreviewUpdate(modelId: string): string {
        return `/api/preview/update/${modelId}`;
    }

    static modelId(id: string): string {
        return `/api/model/${id}`;
    }

    static history(className: string, id: string): string {
        return `/api/history/${className}/${id}`;
    }
}