function excludeFrom<T>(columns: (keyof T)[], entity: T[]): T[];
function excludeFrom<T>(columns: (keyof T)[], entity: T): T;

function excludeFrom<T>(columns: (keyof T)[], entity: T): T {
    if (Array.isArray(entity))
        return columns.reduce((prev, cur) => {
            return prev.map((item) => {
                delete (item as Record<keyof T, any>)[cur];
                return item;
            });
        }, entity) as unknown as T;
    else
        return columns.reduce((prev, key) => {
            delete (prev as Record<keyof T, any>)[key];
            return prev;
        }, entity) as T;
}

export { excludeFrom };
