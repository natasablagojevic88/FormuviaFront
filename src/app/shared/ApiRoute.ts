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

    /**
     * Forma zapisa u podtabeli. Kod unosa id nije poznat, pa u putanju ide "null"
     * (back tu vrednost cita kao prazan id i vraca praznu formu sa vezom na nadredjeni red).
     */
    static modelPreviewFormWithIdAndParent(modelId: string, id: string | null, parent: string): string {
        return `/api/preview/form/${modelId}/${id ?? "null"}/${parent}`;
    }

    /** Snimanje zapisa tabele iz modela (insert kad je id prazan, inace update). */
    static modelPreviewSave(modelId: string): string {
        return `/api/preview/save/${modelId}`;
    }

    static modelId(id: string): string {
        return `/api/model/${id}`;
    }

    static history(className: string, id: string): string {
        return `/api/history/${className}/${id}`;
    }
}