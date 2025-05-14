
      CREATE TABLE IF NOT EXISTS sonar_digests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        summary TEXT NOT NULL,
        topics JSONB NOT NULL,
        raw_html TEXT NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    