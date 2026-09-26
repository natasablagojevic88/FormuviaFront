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

    /** Table of a child model: only the rows that belong to a row of the parent table. */
    static modelPreviewTableWithParent(modelId: string, parentId: string): string {
        return `/api/preview/model/${modelId}/${parentId}`;
    }

    /** Form for a new record. */
    static modelPreviewForm(modelId: string): string {
        return `/api/preview/form/${modelId}`;
    }

    /** Form of an existing record (edit). */
    static modelPreviewFormWithId(modelId: string, id: string): string {
        return `/api/preview/form/${modelId}/${id}`;
    }

    /** Form for a new record in a subtable: an empty form with the link to the parent row. */
    static modelPreviewFormWithParent(modelId: string, parent: string): string {
        return `/api/preview/form/${modelId}/parent/${parent}`;
    }

    /** History of a record of a model table (it has no className like the built-in tables). */
    static modelPreviewHistory(modelId: string, id: string): string {
        return `/api/preview/history/${modelId}/${id}`;
    }

    /** Deleting a record of a model table; the rows of its subtables go with it (cascade). */
    static modelPreviewDelete(modelId: string, id: string): string {
        return `/api/preview/delete/${modelId}/${id}`;
    }

    /** Saving a record of a model table (insert when the id is empty, otherwise update). */
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