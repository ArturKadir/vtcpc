const parts = [
  { label: "Vaizdo plokštė", className: "left-4 right-4 top-[42%] h-8" },
  { label: "Procesorius", className: "left-4 w-24 top-[18%] h-14" },
  { label: "Atmintis", className: "right-4 w-10 top-[16%] h-20" },
  { label: "Maitinimas", className: "left-4 right-4 bottom-4 h-12" },
];

/** Tuščias korpusas — užvedus pelę matosi vidus. */
export function CaseReveal() {
  return (
    <div className="group relative mx-auto aspect-[3/4] w-full max-w-[18rem] cursor-pointer select-none rounded-2xl border-2 border-ink/20 bg-ink p-4 shadow-xl transition-shadow hover:shadow-2xl">
      <div className="absolute inset-3 rounded-xl border border-ink-foreground/10" />

      {parts.map((part) => (
        <div
          key={part.label}
          className={`absolute ${part.className} flex items-center justify-center rounded-lg bg-primary/85 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100`}
        >
          {part.label}
        </div>
      ))}

      <p className="absolute inset-x-0 bottom-[-2.25rem] text-center text-xs text-muted-foreground transition-opacity group-hover:opacity-0">
        Užveskite pelę — pamatysite, kas viduje
      </p>
    </div>
  );
}
