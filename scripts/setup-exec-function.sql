-- Create or replace the exec function for running raw SQL
CREATE OR REPLACE FUNCTION exec(
    query text
) RETURNS void AS $$
BEGIN
    EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
