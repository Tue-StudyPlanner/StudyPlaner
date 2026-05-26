PRAGMA foreign_keys = ON;

UPDATE progress_categories SET name = 'UI & UX' WHERE code = 'HCI_UX';
UPDATE progress_categories SET name = 'Network & Security' WHERE code = 'SYSTEMS_SECURITY';
UPDATE progress_categories SET name = 'Data Science' WHERE code = 'DATA_DATABASES';

DELETE FROM course_progress_category_mappings
 WHERE progress_category_id IN (
   SELECT id FROM progress_categories WHERE code = 'INTERDISCIPLINARY'
 );
DELETE FROM progress_categories WHERE code = 'INTERDISCIPLINARY';
