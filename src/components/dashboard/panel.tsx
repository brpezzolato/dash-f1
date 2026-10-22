import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  kicker?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export function Panel({ title, kicker, action, className, children, id }: Props) {
  return (
    <section id={id} className={cn("glass scroll-mt-6 rounded-3xl p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {kicker && <p className="kicker">{kicker}</p>}
            {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Unavailable({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground py-10 text-center text-sm">{children}</p>;
}
