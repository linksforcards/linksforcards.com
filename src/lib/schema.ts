export const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    website TEXT,
    contact TEXT,
    is_public INTEGER NOT NULL DEFAULT 1,
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    received_on TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS shipment_cards (
    id TEXT PRIMARY KEY,
    shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    set_id TEXT NOT NULL,
    card_number TEXT NOT NULL,
    card_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    dex_numbers TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS binders (
    binder_kind TEXT NOT NULL CHECK (binder_kind IN ('set', 'generation')),
    binder_key TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'given_away')),
    completed_on TEXT,
    given_on TEXT,
    recipient TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    is_public INTEGER NOT NULL DEFAULT 1,
    is_demo INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (binder_kind, binder_key)
  )`,
  `CREATE TABLE IF NOT EXISTS updates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TEXT NOT NULL,
    is_demo INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS price_cache (
    set_id TEXT NOT NULL,
    card_number TEXT NOT NULL,
    cardmarket_cents INTEGER,
    tcgplayer_cents INTEGER,
    cardmarket_as_of TEXT,
    tcgplayer_as_of TEXT,
    note TEXT NOT NULL DEFAULT '',
    fetched_at TEXT NOT NULL,
    PRIMARY KEY (set_id, card_number)
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    ip TEXT NOT NULL,
    success INTEGER NOT NULL,
    attempted_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS shipment_cards_shipment_idx ON shipment_cards (shipment_id)`,
  `CREATE INDEX IF NOT EXISTS shipment_cards_set_idx ON shipment_cards (set_id, card_number)`,
  `CREATE INDEX IF NOT EXISTS shipments_shop_idx ON shipments (shop_id)`,
  `CREATE INDEX IF NOT EXISTS login_attempts_email_idx ON login_attempts (email, attempted_at)`,
  `CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON login_attempts (ip, attempted_at)`,
];
