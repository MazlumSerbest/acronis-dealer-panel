type ListBoxItem = {
    id: number | string;
    name: string;
};

// DataTable
type Column = {
    name: string;
    key: string;
    width?: number;
    sortable?: boolean;
    searchable?: boolean;
};

type ActiveOption = {
    name: string;
    key: string;
};