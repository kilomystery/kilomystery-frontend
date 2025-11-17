export default function CancelPage() {
  return (
    <main className="container py-16">
      <h1 className="text-3xl font-extrabold">Pagamento annullato</h1>
      <p className="text-slate-300 mt-2">Il checkout è stato annullato. Puoi riprovare quando vuoi.</p>
      <a className="btn btn-primary mt-6" href="#cart">Torna al carrello</a>
    </main>
  );
}