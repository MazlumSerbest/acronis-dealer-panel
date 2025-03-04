// V4
type ParasutEntity = {
    id: string;
    type: string;
};

type ParasutInvoice = ParasutEntity & {
    attributes: {
        created_at: string;
        updated_at: string;
        invoice_no: string;
        issue_date: string;
        due_date: string;
        payment_status: string;
        currency: string;
        net_total: string;
        remaining: string;
        sharing_preview_url: string;
    };
    relationships: {
        contact: {
            data: ParasutEntity;
        };
    };
};
