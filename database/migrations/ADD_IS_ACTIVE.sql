SET QUOTED_IDENTIFIER ON;
GO

UPDATE users SET is_active = 1 WHERE is_active IS NULL;
GO

PRINT 'is_active defaults set';
