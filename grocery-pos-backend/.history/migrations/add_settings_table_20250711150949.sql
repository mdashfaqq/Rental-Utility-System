CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_type_key` (`type`, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default settings
INSERT INTO `settings` (`type`, `key`, `value`) VALUES
('store', 'name', 'Grocery Store'),
('store', 'address', '123 Main Street, City, State 12345'),
('store', 'phone', '+91 9876543210'),
('store', 'email', 'store@example.com'),
('store', 'gstNumber', '22AAAAA0000A1Z5'),
('store', 'licenseNumber', 'LIC123456789'),
('tax', 'gstRate', '18'),
('tax', 'cgstRate', '9'),
('tax', 'sgstRate', '9'),
('tax', 'enableTax', 'true'),
('tax', 'taxIncluded', 'false'),
('print', 'defaultPrinter', 'thermal'),
('print', 'paperSize', '80mm'),
('print', 'autoPrint', 'true'),
('print', 'printLogo', 'true'),
('print', 'printGst', 'true'),
('system', 'currency', 'inr'),
('system', 'dateFormat', 'dd/mm/yyyy'),
('system', 'lowStockAlert', '10'),
('system', 'enableNotifications', 'true'),
('security', 'requireLogin', 'true'),
('security', 'autoLogout', 'true'),
('security', 'sessionTimeout', '30'),
('security', 'enableAuditLog', 'true'),
('security', 'passwordPolicy', 'medium')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
