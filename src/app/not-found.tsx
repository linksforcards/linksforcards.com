export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#d7f0ff",
          color: "#1b2430",
          fontFamily: "Nunito, Quicksand, sans-serif",
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
            Nintendo, Creatures, Game Freak, or The Pokémon Company. Card images are shown via TCGdex. Pokémon and
            card images © Nintendo, Creatures, and GAME FREAK.
          </p>
        </main>
      </body>
    </html>
  );
}
