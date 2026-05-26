PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO progress_categories (
    code,
    name,
    description,
    reference_ects,
    color_token,
    sort_order
) VALUES
    ('CLOUD_DEV', 'Cloud Dev', 'Cloud-native development, distributed systems, and DevOps.', 12, 'cat-prak', 100);
