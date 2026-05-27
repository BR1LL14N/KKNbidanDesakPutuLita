// Siku-siku sudut (Bracket Ticks) khas mockup Google Stitch — shared component
export default function BracketFrame() {
  return (
    <>
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-slate-300 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-slate-300 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-slate-300 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-slate-300 pointer-events-none" />
    </>
  );
}
