ALTER DATABASE atmt RENAME TO atmtstaging;

CREATE DATABASE atmt;

\c atmt

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SEQUENCE tblbranches_bnc_id_seq AS INT START WITH 1;
CREATE TABLE tblbranches (
	bnc_id VARCHAR(10) PRIMARY KEY DEFAULT ('BRNCH'|| RIGHT('00000'||(nextval('tblbranches_bnc_id_seq'::regclass)),5)),
	bnc_name VARCHAR(50) NOT NULL,
	bnc_altname VARCHAR(50),
	bnc_buildingno VARCHAR(40),
	bnc_streetno VARCHAR(15),
	bnc_district VARCHAR(25),
	bnc_pobox VARCHAR(10),
	bnc_city VARCHAR(20),
	bnc_citycode VARCHAR(10),
	bnc_country VARCHAR(30),
	bnc_phone VARCHAR(9),
	bnc_landline VARCHAR(9),
	bnc_email VARCHAR(100),
	bnc_website VARCHAR(100),
	bnc_vatno VARCHAR(15) UNIQUE NOT NULL,
	bnc_crno VARCHAR(10),
	bnc_isdeleted BOOLEAN DEFAULT FALSE,
	bnc_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE SEQUENCE tbluserroles_usrr_id_seq AS INT START WITH 1;
CREATE TABLE tbluserroles (
	usrr_id VARCHAR(10) PRIMARY KEY DEFAULT ('USRRL'|| RIGHT('00000'||(nextval('tbluserroles_usrr_id_seq'::regclass)),5)),
	usrr_role VARCHAR(30) UNIQUE NOT NULL,
	usrr_isvisible BOOLEAN DEFAULT TRUE,
	ussr_isdeleted BOOLEAN DEFAULT FALSE,
	ussr_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);
INSERT INTO tbluserroles(usrr_role,usrr_isvisible) VALUES ('SuperAdmin', false), ('Admin', true), ('User', true);

CREATE TABLE tblusers (
	usr_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	usr_name VARCHAR(50) NOT NULL,
	usr_username VARCHAR(20) UNIQUE NOT NULL,
	usr_password VARCHAR(100) NOT NULL,
	usr_email VARCHAR(100),
	usr_contact VARCHAR(10),
	usr_isactive BOOLEAN NOT NULL DEFAULT TRUE,
	usr_isdeleted BOOLEAN DEFAULT FALSE,
	usr_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	usrr_id VARCHAR(10) REFERENCES tbluserroles(usrr_id),
	bnc_id VARCHAR(10) REFERENCES tblbranches(bnc_id)
);
INSERT INTO tblusers(usr_name, usr_username, usr_password, usr_email, usr_contact, usrr_id) VALUES ('Krishna Prasad M.', 'krishnaprasadm', '$2b$10$EHjWpGg.XQ3JaV6ZQs4do.GCDtygiS7KJ7u7rlg/aGpk9S9mrEe76', 'krishnaprasad1991@gmail.com', '8553818842', 'USRRL00001');

CREATE SEQUENCE tblvatpercentage_vatp_id_seq AS INT START WITH 1;
CREATE TABLE tblvatpercentage (
	vatp_id VARCHAR(10) PRIMARY KEY DEFAULT ('VATP'|| RIGHT('00000'||(nextval('tblvatpercentage_vatp_id_seq'::regclass)),5)),
	vatp_value INT UNIQUE NOT NULL,
	vatp_isdeleted BOOLEAN DEFAULT FALSE,
	vatp_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	CHECK (vatp_value BETWEEN 1 AND 99)
);
INSERT INTO tblvatpercentage(vatp_value) VALUES (15);

CREATE SEQUENCE tblbrands_bnd_id_seq AS INT START WITH 1;
CREATE TABLE tblbrands (
	bnd_id VARCHAR(10) PRIMARY KEY DEFAULT ('BRAND'|| RIGHT('00000'||(nextval('tblbrands_bnd_id_seq'::regclass)),5)),
	bnd_name VARCHAR(50) UNIQUE NOT NULL,
	bnd_isdeleted BOOLEAN DEFAULT FALSE,
	bnd_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);
INSERT INTO tblbrands(bnd_name) VALUES ('UNKNOWN');

CREATE SEQUENCE tblcategories_cat_id_seq AS INT START WITH 1;
CREATE TABLE tblcategories (
	cat_id VARCHAR(10) PRIMARY KEY DEFAULT ('CATRY'|| RIGHT('00000'||(nextval('tblcategories_cat_id_seq'::regclass)),5)),
	cat_name VARCHAR(50) UNIQUE NOT NULL,
	cat_isdeleted BOOLEAN DEFAULT FALSE,
	cat_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);
INSERT INTO tblcategories(cat_name) VALUES ('UNCATEGORIZED'),('CONS'),('MATL'),('PLB'),('SFTY'),('TLS');

CREATE SEQUENCE tblunittypes_unty_id_seq AS INT START WITH 1;
CREATE TABLE tblunittypes (
	unty_id VARCHAR(10) PRIMARY KEY DEFAULT ('UNTTY'|| RIGHT('00000'||(nextval('tblunittypes_unty_id_seq'::regclass)),5)),
	unty_name VARCHAR(30) UNIQUE NOT NULL,
	unty_isdeleted BOOLEAN DEFAULT FALSE,
	unty_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);
INSERT INTO tblunittypes(unty_name) VALUES ('BAG'),('BDL'),('BND'),('BOX'),('CAN'),('EA'),('LM'),('MTR'),('PAIL'),('PAIR'),('PCS'),('PKT'),('ROLL'),('SET'),('TUBE');

CREATE SEQUENCE tblproducts_pro_id_seq AS INT START WITH 1;
CREATE TABLE tblproducts (
	pro_id VARCHAR(10) PRIMARY KEY DEFAULT ('PRODT'|| RIGHT('00000'||(nextval('tblproducts_pro_id_seq'::regclass)),5)),
	pro_name VARCHAR(70) NOT NULL,
	pro_altname VARCHAR(70),
	pro_isactive BOOLEAN NOT NULL DEFAULT TRUE,
	pro_isdeleted BOOLEAN DEFAULT FALSE,
	pro_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	vatp_id VARCHAR(10) REFERENCES tblvatpercentage(vatp_id),
	bnd_id VARCHAR(10) REFERENCES tblbrands(bnd_id),
	cat_id VARCHAR(10) REFERENCES tblcategories(cat_id),
	unty_id VARCHAR(10) REFERENCES tblunittypes(unty_id)
);

CREATE SEQUENCE tblvendors_ven_id_seq AS INT START WITH 1;
CREATE TABLE tblvendors (
	ven_id VARCHAR(10) PRIMARY KEY DEFAULT ('VENDR'|| RIGHT('00000'||(nextval('tblvendors_ven_id_seq'::regclass)),5)),
	ven_name VARCHAR(80) NOT NULL,
	ven_altname VARCHAR(80),
	ven_buildingno VARCHAR(40),
	ven_streetno VARCHAR(15),
	ven_district VARCHAR(25),
	ven_pobox VARCHAR(10),
	ven_city VARCHAR(20),
	ven_citycode VARCHAR(10),
	ven_country VARCHAR(30),
	ven_phone VARCHAR(9) NOT NULL,
	ven_landline VARCHAR(9),
	ven_email VARCHAR(100),
	ven_website VARCHAR(100),
	ven_vatno VARCHAR(15) NOT NULL,
	ven_crno VARCHAR(10) NOT NULL,
	ven_isdeleted BOOLEAN DEFAULT FALSE,
	ven_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE SEQUENCE tblpurchaseorders_por_id_seq AS INT START WITH 1;
CREATE TABLE tblpurchaseorders (
	por_id VARCHAR(10) PRIMARY KEY DEFAULT ('PORDR'|| RIGHT('00000'||(nextval('tblpurchaseorders_por_id_seq'::regclass)),5)),
	por_no VARCHAR(15) NOT NULL,
	por_purchasedon DATE NOT NULL,
	por_refno VARCHAR(30),
	por_isdeleted BOOLEAN DEFAULT FALSE,
	por_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	ven_id VARCHAR(10) REFERENCES tblvendors(ven_id),
	pyt_id VARCHAR(10) REFERENCES tblpaymentterms(pyt_id),
	bnc_id VARCHAR(10) REFERENCES tblbranches(bnc_id),
	usr_id UUID REFERENCES tblusers(usr_id)
);

CREATE SEQUENCE tblinventories_inv_id_seq AS INT START WITH 1;
CREATE TABLE tblinventories (
	inv_id VARCHAR(10) PRIMARY KEY DEFAULT ('INVT'|| RIGHT('0000000'||(nextval('tblinventories_inv_id_seq'::regclass)),6)),
	inv_quantitybought INT NOT NULL DEFAULT 0,
	inv_quantityleft INT NOT NULL DEFAULT 0,
	inv_discountprice NUMERIC(10,4) NOT NULL DEFAULT 0,
	inv_vatonnetprice NUMERIC(10,4) NOT NULL DEFAULT 0,
	inv_netprice NUMERIC(10,4) NOT NULL DEFAULT 0,
	inv_isdeleted BOOLEAN DEFAULT FALSE,
	inv_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	pro_id VARCHAR(10) REFERENCES tblproducts(pro_id),
	por_id VARCHAR(10) REFERENCES tblpurchaseorders(por_id)
);

CREATE SEQUENCE tblorderinventories_orin_id_seq AS INT START WITH 1;
CREATE TABLE tblorderinventories (
	orin_id VARCHAR(12) PRIMARY KEY DEFAULT ('ORIN'|| RIGHT('000000000'||(nextval('tblorderinventories_orin_id_seq'::regclass)),8)),
	orin_quantity INT NOT NULL DEFAULT 0,
	orin_isdeleted BOOLEAN DEFAULT FALSE,
	orin_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	ordi_id VARCHAR(10) REFERENCES tblorderitems(ordi_id),
	inv_id VARCHAR(10) REFERENCES tblinventories(inv_id)
);

CREATE SEQUENCE tblpricelists_prl_id_seq AS INT START WITH 1;
CREATE TABLE tblpricelists (
	prl_id VARCHAR(10) PRIMARY KEY DEFAULT ('PRICE'|| RIGHT('00000'||(nextval('tblpricelists_prl_id_seq'::regclass)),5)),
	prl_sellingprice NUMERIC(10,2) NOT NULL DEFAULT 0.00,
	prl_discountprice NUMERIC(10,2) NOT NULL DEFAULT 0.00,
	prl_marginprice NUMERIC(10,2) NOT NULL DEFAULT 0.00,
	prl_isdeleted BOOLEAN DEFAULT FALSE,
	prl_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	pro_id VARCHAR(10) REFERENCES tblproducts(pro_id),
	bnc_id VARCHAR(10) REFERENCES tblbranches(bnc_id),
	usr_id UUID REFERENCES tblusers(usr_id)
);

CREATE SEQUENCE tblpaymentterms_pyt_id_seq AS INT START WITH 1;
CREATE TABLE tblpaymentterms (
	pyt_id VARCHAR(10) PRIMARY KEY DEFAULT ('PYMTT'|| RIGHT('00000'||(nextval('tblpaymentterms_pyt_id_seq'::regclass)),5)),
	pyt_name VARCHAR(30) UNIQUE NOT NULL,
	pyt_isdeleted BOOLEAN DEFAULT FALSE,
	pyt_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);
INSERT INTO tblpaymentterms(pyt_name) VALUES ('CASH'),('IMMEDIATE PAYMENT'),('15 DAYS'),('30 DAYS'),('45 DAYS'),('60 DAYS');

CREATE SEQUENCE tblclients_cli_id_seq AS INT START WITH 1;
CREATE TABLE tblclients (
	cli_id VARCHAR(10) PRIMARY KEY DEFAULT ('CLINT'|| RIGHT('00000'||(nextval('tblclients_cli_id_seq'::regclass)),5)),
	cli_name VARCHAR(80) NOT NULL,
	cli_altname VARCHAR(80),
	cli_type CHAR(1) NOT NULL,
	cli_buildingno VARCHAR(40),
	cli_streetno VARCHAR(15),
	cli_district VARCHAR(25),
	cli_pobox VARCHAR(10),
	cli_city VARCHAR(20),
	cli_citycode VARCHAR(10),
	cli_country VARCHAR(30),
	cli_phone VARCHAR(9) NOT NULL,
	cli_landline VARCHAR(9),
	cli_email VARCHAR(100),
	cli_website VARCHAR(100),
	cli_vatno VARCHAR(15),
	cli_crno VARCHAR(10),
	cli_isdeleted BOOLEAN DEFAULT FALSE,
	cli_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE SEQUENCE invoice_no_seq AS INT START WITH 3524;
CREATE SEQUENCE quotation_no_seq AS INT START WITH 1;
CREATE SEQUENCE deliverynote_no_seq AS INT START WITH 1;

CREATE TABLE tblordertypes (
	ordt_id SERIAL PRIMARY KEY,
	ordt_name VARCHAR(25) NOT NULL,
	ordt_isdeleted BOOLEAN DEFAULT FALSE,
	ordt_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);
INSERT INTO tblordertypes(ordt_name) VALUES ('Tax Invoice'), ('Simplified Tax Invoice'), ('Quotation'), ('Delivery Note');

CREATE SEQUENCE tblorders_ord_id_seq AS INT START WITH 1;
CREATE TABLE tblorders (
	ord_id VARCHAR(10) PRIMARY KEY DEFAULT ('ORD'|| RIGHT('0000000'||(nextval('tblorders_ord_id_seq'::regclass)),7)),
	ord_no VARCHAR(15) NOT NULL,
	ord_validtill TIMESTAMP,
	ord_refno VARCHAR(30),
	ord_isdeleted BOOLEAN DEFAULT FALSE,
	ord_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	ordt_id INT REFERENCES tblordertypes(ordt_id),
	bnc_id VARCHAR(10) REFERENCES tblbranches(bnc_id),
	cli_id VARCHAR(10) REFERENCES tblclients(cli_id),
	pyt_id VARCHAR(10) REFERENCES tblpaymentterms(pyt_id),
	usr_id UUID REFERENCES tblusers(usr_id)
);

CREATE SEQUENCE tblorderitems_ordi_id_seq AS INT START WITH 1;
CREATE TABLE tblorderitems (
	ordi_id VARCHAR(10) PRIMARY KEY DEFAULT ('ORDI'|| RIGHT('00000'||(nextval('tblorderitems_ordi_id_seq'::regclass)),5)),
	ordi_sellingpriceperitem NUMERIC(10,2) NOT NULL,
	ordi_discountpriceperitem NUMERIC(10,4) NOT NULL,
	ordi_quantity INT NOT NULL,
	ordi_addedby UUID REFERENCES tblusers(usr_id),
	ordi_isdeleted BOOLEAN DEFAULT FALSE,
	ord_id VARCHAR(10) REFERENCES tblorders(ord_id),
	pro_id VARCHAR(10) REFERENCES tblproducts(pro_id),
	vatp_id VARCHAR(10) REFERENCES tblvatpercentage(vatp_id)
);