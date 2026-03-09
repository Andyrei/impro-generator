import Link from "next/link";

export default function DocsPage() {

    type DifficultyLevel = {
        level: "Facile" | "Medio" | "Difficile";
        title: string;
        definition: string;
        examples: string[];
        why: string;
        color: "green" | "yellow" | "red";
    };
    const levelStyles = {
        Facile: {
            box: "border-emerald-400/70 bg-emerald-950/20",
            chip: "bg-emerald-400 text-emerald-950",
            accent: "text-emerald-300",
        },
        Medio: {
            box: "border-amber-400/70 bg-amber-950/20",
            chip: "bg-amber-400 text-amber-950",
            accent: "text-amber-300",
        },
        Difficile: {
            box: "border-rose-400/70 bg-rose-950/20",
            chip: "bg-rose-400 text-rose-950",
            accent: "text-rose-300",
        },
    } as const;
    const difficulty_levels: DifficultyLevel[] = [
        {
            level: "Facile",
            title: "Mundane / Day-to-Day (Quotidiano)",
            definition:
            "Situazioni e ruoli che esistono nel mondo reale e che fanno parte dell’esperienza comune della maggior parte delle persone.",
            examples: [
            "barista",
            "colleghi d’ufficio",
            "una coppia che litiga per il bucato",
            "addetto fast-food",
            ],
            why:
            "Le regole del mondo sono già note, quindi puoi concentrarti completamente sulle relazioni tra i personaggi.",
            color: "green",
        },
        {
            level: "Medio",
            title: "Exotic / Specialist (Specialistico)",
            definition:
            "Ruoli reali ma fuori dall’esperienza quotidiana della persona media.",
            examples: [
            "astronauti",
            "neurochirurghi",
            "sommozzatori d’altura",
            "cavaliere medievale (storico)",
            ],
            why:
            "Devi stabilire le regole specifiche del contesto (es. \"non toccare la valvola dell’ossigeno\") mantenendo i personaggi credibili e relazionabili.",
            color: "yellow",
        },
        {
            level: "Difficile",
            title: "Fantastic / Genre (Fantastico)",
            definition:
            "Mondi governati da regole che non esistono nella nostra realtà.",
            examples: [
            "pirati (stilizzati/cinematografici)",
            "streghe",
            "animali parlanti",
            "alieni su un pianeta lontano",
            ],
            why:
            "Devi costruire da zero la fisica e la logica del mondo prima ancora di trovare cosa sia \"insolito\" nella scena.",
            color: "red",
        },
    ];

    return (
        <div className="mx-5 my-10 max-w-2xl md:mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Guida alle Parole</h1>
        <p className="text-center text-zinc-300 mb-10">
            Come suggerire una parola e capire la difficoltà
        </p>

        {/* ── Come suggerire una parola ── */}
        <section className="mb-10">
            <h2 className="text-xl font-bold mb-3">Come inserire un nuovo suggerimento</h2>
            <p className="text-zinc-300 leading-relaxed">
            Puoi suggerire nuove parole direttamente dall&apos;app tramite il pulsante
            &ldquo;Suggerisci&rdquo; nella schermata principale. Ogni suggerimento viene
            revisionato prima di essere aggiunto al gioco.
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-zinc-300">
            <li>Scegli la <strong className="text-foreground"> categoria </strong> più adatta alla parola.</li>
            <li>Scrivi la <strong className="text-foreground"> parola </strong> in italiano.</li>
            <li>Assegna il giusto <strong className="text-foreground"> livello di difficoltà </strong> (vedi sotto).</li>
            <li>Invia — e grazie!</li>
            </ul>
        </section>

        {/* ── Gradi di Realtà ── */}
        <section className="mb-10">
            <h2 className="text-xl font-bold mb-1">I Gradi di Realtà</h2>
            <p className="text-sm text-zinc-300 italic mb-4">
            Il criterio di difficoltà si basa sul concetto di <em>Degrees of Reality</em> (Gradi di Realtà)
            usato nell&apos;improvvisazione teatrale per classificare quanto il punto di partenza di
            una scena si distacca dalla vita quotidiana del pubblico.
            </p>
            <p className="text-zinc-300 leading-relaxed">
            Più una parola è vicina alla realtà di tutti i giorni, più è <strong className="text-foreground"> facile </strong>{" "}
            da usare come spunto improvvisativo — perché sia gli attori che il pubblico hanno
            riferimenti immediati. Più la parola è astratta, insolita o distante dal vissuto comune,
            più diventa una sfida creativa.
            </p>
        </section>

        {/* ── Livelli ── */}
        <section className="mb-10 space-y-5">
            <h2 className="text-xl font-bold">I tre livelli di difficoltà</h2>

            {difficulty_levels.map((level) => {
            const s = levelStyles[level.level];
            return <div key={level.level} className={`rounded-xl border-2 ${s.box} p-2`}>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-block rounded-full ${s.chip} text-xs font-bold px-3 py-1`}>
                        {level.level.toUpperCase()}
                    </span>
                    <span className="text-lg text-foreground font-bold">{level.title}</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-sm">
                    <span className="font-bold">Definizione:</span> {level.definition}
                </p>
                <p className="text-zinc-300 text-sm mt-2">
                    <span className="font-bold">Esempi:</span> <em>{level.examples.join(", ")}</em>.
                </p>
                <p className="text-zinc-300 text-sm mt-2">
                    <span className="font-bold">Perché è {level.level.toLowerCase()}:</span> {level.why}
                </p>
            </div>
        })}
        </section>

        {/* ── Consiglio ── */}
        <section className="mb-10 bg-muted/50 rounded-xl">
            <h2 className="text-lg font-bold mb-2">Consiglio rapido</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">
                Chiediti: <em>&ldquo;Quante persone hanno vissuto direttamente questa situazione?&rdquo;</em>
            </p>
            <ul className="list-disc list-inside mt-2 mb-0 text-zinc-300">
                <li><em>quasi tutti</em> → <strong className="text-green-500">Facile</strong></li>
                <li><em>qualcuno</em> → <strong className="text-yellow-500">Medio</strong></li>
                <li><em>pochissimi o nessuno</em> → <strong className="text-red-500">Difficile</strong></li>
            </ul>
        </section>

        {/* ── Footer ── */}
        <div className="text-center mt-12">
            <Link
            href="/it"
            className="text-sm text-zinc-300 hover:text-foreground transition-colors underline underline-offset-4"
            >
            ← Torna alla home
            </Link>
        </div>
        </div>
    );
}
