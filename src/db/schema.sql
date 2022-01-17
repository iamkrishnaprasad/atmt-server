CREATE DATABASE atmt;

\c atmt

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SEQUENCE tblbranches_bnc_id_seq AS INT START WITH 1;
CREATE TABLE tblbranches (
	bnc_id VARCHAR(10) PRIMARY KEY DEFAULT ('BRNCH'|| RIGHT('00000'||(nextval('tblbranches_bnc_id_seq'::regclass)),5)),
	bnc_name VARCHAR(50) NOT NULL,
	bnc_altname VARCHAR(50),
	bnc_buildingno VARCHAR(10),
	bnc_streetno VARCHAR(10),
	bnc_district VARCHAR(20),
	bnc_pobox VARCHAR(10),
	bnc_city VARCHAR(20),
	bnc_citycode VARCHAR(10),
	bnc_country VARCHAR(20),
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
	usrr_role VARCHAR(20) UNIQUE NOT NULL,
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
	usr_contact VARCHAR(9),
	usr_isactive BOOLEAN NOT NULL DEFAULT TRUE,
	usr_isdeleted BOOLEAN DEFAULT FALSE,
	usr_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	usrr_id VARCHAR(10) REFERENCES tbluserroles(usrr_id),
	bnc_id VARCHAR(10) REFERENCES tblbranches(bnc_id)
);
INSERT INTO tblusers(usr_name, usr_username, usr_password, usr_email, usr_contact, usrr_id) VALUES ('Krishna Prasad M.', 'krishnaprasadm', '$2b$10$wN6QX99tFdpZ6sRl36WlxeW0Ce8E7SK1YVZR8FT27uQZxUfuqd7ki', 'krishnaprasad1991@gmail.com', '987654321', 'USRRL00001');

CREATE SEQUENCE tblvat_vat_id_seq AS INT START WITH 1;
CREATE TABLE tblvat (
	vat_id VARCHAR(10) PRIMARY KEY DEFAULT ('VAT'|| RIGHT('00000'||(nextval('tblvat_vat_id_seq'::regclass)),5)),
	vat_percentage INT UNIQUE NOT NULL,
	vat_isdeleted BOOLEAN DEFAULT FALSE,
	vat_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	CHECK (vat_percentage BETWEEN 1 AND 100)
);

CREATE SEQUENCE tblbrands_bnd_id_seq AS INT START WITH 1;
CREATE TABLE tblbrands (
	bnd_id VARCHAR(10) PRIMARY KEY DEFAULT ('BRAND'|| RIGHT('00000'||(nextval('tblbrands_bnd_id_seq'::regclass)),5)),
	bnd_name VARCHAR(50) UNIQUE NOT NULL,
	bnd_isdeleted BOOLEAN DEFAULT FALSE,
	bnd_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE SEQUENCE tblcategories_cat_id_seq AS INT START WITH 1;
CREATE TABLE tblcategories (
	cat_id VARCHAR(10) PRIMARY KEY DEFAULT ('PRDCT'|| RIGHT('00000'||(nextval('tblcategories_cat_id_seq'::regclass)),5)),
	cat_name VARCHAR(50) UNIQUE NOT NULL,
	cat_isdeleted BOOLEAN DEFAULT FALSE,
	cat_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE SEQUENCE tblunittypes_unty_id_seq AS INT START WITH 1;
CREATE TABLE tblunittypes (
	unty_id VARCHAR(10) PRIMARY KEY DEFAULT ('UNTTY'|| RIGHT('00000'||(nextval('tblunittypes_unty_id_seq'::regclass)),5)),
	unty_name VARCHAR(30) UNIQUE NOT NULL,
	unty_isdeleted BOOLEAN DEFAULT FALSE,
	unty_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE SEQUENCE tblproducts_pro_id_seq AS INT START WITH 1;
CREATE TABLE tblproducts (
	pro_id VARCHAR(10) PRIMARY KEY DEFAULT ('PRODT'|| RIGHT('00000'||(nextval('tblproducts_pro_id_seq'::regclass)),5)),
	pro_name VARCHAR(70) NOT NULL,
	pro_altname VARCHAR(50),
	pro_description VARCHAR(200),
	pro_isactive BOOLEAN NOT NULL DEFAULT TRUE,
	pro_isdeleted BOOLEAN DEFAULT FALSE,
	pro_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	vat_id VARCHAR(10) REFERENCES tblvat(vat_id),
	bnd_id VARCHAR(10) REFERENCES tblbrands(bnd_id),
	cat_id VARCHAR(10) REFERENCES tblcategories(cat_id),
	unty_id VARCHAR(10) REFERENCES tblunittypes(unty_id)
);

CREATE SEQUENCE tblvendors_ven_id_seq AS INT START WITH 1;
CREATE TABLE tblvendors (
	ven_id VARCHAR(10) PRIMARY KEY DEFAULT ('VENDR'|| RIGHT('00000'||(nextval('tblvendors_ven_id_seq'::regclass)),5)),
	ven_name VARCHAR(50) NOT NULL,
	ven_altname VARCHAR(50),
	ven_buildingno VARCHAR(10),
	ven_streetno VARCHAR(10),
	ven_district VARCHAR(20),
	ven_pobox VARCHAR(10),
	ven_city VARCHAR(20),
	ven_citycode VARCHAR(10),
	ven_country VARCHAR(20),
	ven_contact VARCHAR(9),
	ven_email VARCHAR(100),
	ven_website VARCHAR(100),
	ven_vatno VARCHAR(15),
	ven_crno VARCHAR(10),
	ven_isdeleted BOOLEAN DEFAULT FALSE,
	ven_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE SEQUENCE tblpurchaseorders_por_id_seq AS INT START WITH 1;
CREATE TABLE tblpurchaseorders (
	por_id VARCHAR(10) PRIMARY KEY DEFAULT ('PORDR'|| RIGHT('00000'||(nextval('tblpurchaseorders_por_id_seq'::regclass)),5)),
	por_purchaseorderno VARCHAR(20),
	por_purchasedate TIMESTAMP,
	por_isdeleted BOOLEAN DEFAULT FALSE,
	por_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	ven_id VARCHAR(10) REFERENCES tblvendors(ven_id),
	bnc_id VARCHAR(10) REFERENCES tblbranches(bnc_id),
	usr_id UUID REFERENCES tblusers(usr_id)
);

CREATE SEQUENCE tblinventories_inv_id_seq AS INT START WITH 1;
CREATE TABLE tblinventories (
	inv_id VARCHAR(10) PRIMARY KEY DEFAULT ('INVT'|| RIGHT('00000'||(nextval('tblinventories_inv_id_seq'::regclass)),5)),
	inv_purchasepriceperitem NUMERIC(10,2) NOT NULL,
	inv_sellingpriceperitem NUMERIC(10,2) NOT NULL,
	inv_quantity INT NOT NULL,
	inv_inventoryaddeddate TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	inv_addedby UUID REFERENCES tblusers(usr_id),
	inv_isdeleted BOOLEAN DEFAULT FALSE,
	por_id VARCHAR(10) REFERENCES tblpurchaseorders(por_id),
	pro_id VARCHAR(10) REFERENCES tblproducts(pro_id),
	vat_id VARCHAR(10) REFERENCES tblvat(vat_id)
);

CREATE SEQUENCE tblstocks_stk_id_seq AS INT START WITH 1;
CREATE TABLE tblstocks (
	stk_id VARCHAR(10) PRIMARY KEY DEFAULT ('STOCK'|| RIGHT('00000'||(nextval('tblstocks_stk_id_seq'::regclass)),5)),
	stk_quantity INT NOT NULL DEFAULT 0,
	stk_lowstockvalue INT NOT NULL DEFAULT 5,
	stk_isdeleted BOOLEAN DEFAULT FALSE,
	stk_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc'),
	pro_id VARCHAR(10) REFERENCES tblproducts(pro_id),
	bnc_id VARCHAR(10) REFERENCES tblbranches(bnc_id),
	usr_id UUID REFERENCES tblusers(usr_id)
);

CREATE SEQUENCE tblpricelists_prl_id_seq AS INT START WITH 1;
CREATE TABLE tblpricelists (
	prl_id VARCHAR(10) PRIMARY KEY DEFAULT ('PRICE'|| RIGHT('00000'||(nextval('tblpricelists_prl_id_seq'::regclass)),5)),
	prl_sellingprice NUMERIC(10,2) NOT NULL DEFAULT 0.00,
	prl_discountprice NUMERIC(10,2) NOT NULL DEFAULT 0.00,
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

CREATE SEQUENCE tblclients_cli_id_seq AS INT START WITH 1;
CREATE TABLE tblclients (
	cli_id VARCHAR(10) PRIMARY KEY DEFAULT ('CLINT'|| RIGHT('00000'||(nextval('tblclients_cli_id_seq'::regclass)),5)),
	cli_name VARCHAR(50) NOT NULL,
	cli_altname VARCHAR(50),
	cli_buildingno VARCHAR(10),
	cli_streetno VARCHAR(10),
	cli_district VARCHAR(20),
	cli_pobox VARCHAR(10),
	cli_city VARCHAR(20),
	cli_citycode VARCHAR(10),
	cli_country VARCHAR(20),
	cli_contact VARCHAR(9),
	cli_email VARCHAR(100),
	cli_website VARCHAR(100),
	cli_vatno VARCHAR(15),
	cli_crno VARCHAR(10),
	cli_isdeleted BOOLEAN DEFAULT FALSE,
	cli_created_at TIMESTAMP DEFAULT (now() AT TIME ZONE 'utc')
);
