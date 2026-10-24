export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#efe6d6",
          color: "#231c16",
          fontFamily: "Georgia, 'Source Sans 3', sans-serif",
        }}
      >
        <main style={{ width: "min(40rem, calc(100% - 2rem))", margin: "4rem auto" }}>
          <h1>This page is not in the binder.</h1>
          <p>The address does not match anything on the site.</p>
          <p>
            <a href="/">Back to the start</a>
          </p>
          <p>
            LinksForCards is an unofficial fan project by Magnus Schmidt. It is not affiliated with or endorsed by
            Nintendo, Creatures, Game Freak, or The Pokémon Company.
          </p>
        </main>
      </body>
    </html>
  );
}
