import type { IconType } from 'react-icons';
import * as LuIcons from 'react-icons/lu';
import * as PiIcons from 'react-icons/pi';
import * as TbIcons from 'react-icons/tb';

type IconLibrary = 'lu' | 'tb' | 'pi';

const libraries: Record<
    IconLibrary,
    Record<string, IconType>
> = {
    lu: LuIcons as Record<string, IconType>,
    tb: TbIcons as Record<string, IconType>,
    pi: PiIcons as Record<string, IconType>,
};

interface CategoryIconProps {
    library?: string | null;
    name?: string | null;
    className?: string;
}

export default function CategoryIcon({
                                         library,
                                         name,
                                         className = 'size-5',
                                     }: CategoryIconProps) {
    if (!library || !name) {
        return (
            <span
                className={`${className} inline-block rounded-sm bg-muted`}
            />
        );
    }

    if (!(library in libraries)) {
        return <UnknownIcon className={className} />;
    }

    const Icon =
        libraries[library as IconLibrary][name];

    if (!Icon) {
        return <UnknownIcon className={className} />;
    }

    return <Icon className={className} />;
}

function UnknownIcon({
                         className,
                     }: {
    className: string;
}) {
    return (
        <span
            className={`${className} inline-flex items-center justify-center rounded-sm bg-destructive/10 text-xs text-destructive`}
        >
            ?
        </span>
    );
}
