import { useTranslations } from "next-intl";

type Props = {
    error: any;
};

export default function FormError({ error }: Props) {
    const te = useTranslations("FormMessages");

    if (!error) return null;
    return (
        <p className="text-[0.8em] font-medium text-destructive">
            {te(error.message)}
        </p>
    );
}
