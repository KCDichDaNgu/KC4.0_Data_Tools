--
-- PostgreSQL database dump
--

-- Dumped from database version 12.0
-- Dumped by pg_dump version 12.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: clienttypes; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.clienttypes AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE public.clienttypes OWNER TO postgres;

--
-- Name: tokentypes; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tokentypes AS ENUM (
    'Bearer'
);


ALTER TYPE public.tokentypes OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: oauth2_client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth2_client (
    client_id character varying(40) NOT NULL,
    client_secret character varying(55) NOT NULL,
    user_id integer NOT NULL,
    client_type public.clienttypes NOT NULL,
    redirect_uris text NOT NULL,
    default_scopes text NOT NULL
);


ALTER TABLE public.oauth2_client OWNER TO postgres;

--
-- Name: oauth2_grant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth2_grant (
    id integer NOT NULL,
    user_id integer NOT NULL,
    client_id character varying(40) NOT NULL,
    code character varying(255) NOT NULL,
    redirect_uri character varying(255) NOT NULL,
    expires timestamp without time zone NOT NULL,
    scopes text NOT NULL
);


ALTER TABLE public.oauth2_grant OWNER TO postgres;

--
-- Name: oauth2_grant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.oauth2_grant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.oauth2_grant_id_seq OWNER TO postgres;

--
-- Name: oauth2_grant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.oauth2_grant_id_seq OWNED BY public.oauth2_grant.id;


--
-- Name: oauth2_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth2_token (
    id integer NOT NULL,
    client_id character varying(40) NOT NULL,
    user_id integer NOT NULL,
    token_type public.tokentypes NOT NULL,
    access_token character varying(255) NOT NULL,
    refresh_token character varying(255),
    expires timestamp without time zone NOT NULL,
    scopes text NOT NULL
);


ALTER TABLE public.oauth2_token OWNER TO postgres;

--
-- Name: oauth2_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.oauth2_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.oauth2_token_id_seq OWNER TO postgres;

--
-- Name: oauth2_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.oauth2_token_id_seq OWNED BY public.oauth2_token.id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    color character varying(80) NOT NULL,
    camera_behind_amount integer,
    camera_behind_feature character varying(160),
    camera_behind_pixel integer,
    camera_selfie integer,
    os_name character varying(80),
    os_version double precision,
    price integer,
    ram integer,
    rom integer,
    screen_size double precision,
    screen_tech character varying(80)
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_id_seq OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier (
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    size integer,
    city character varying(80) NOT NULL
);


ALTER TABLE public.supplier OWNER TO postgres;

--
-- Name: supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.supplier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.supplier_id_seq OWNER TO postgres;

--
-- Name: supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.supplier_id_seq OWNED BY public.supplier.id;


--
-- Name: supply_product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supply_product (
    sid integer NOT NULL,
    pid integer NOT NULL,
    quantity integer
);


ALTER TABLE public.supply_product OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    id integer NOT NULL,
    username character varying(80) NOT NULL,
    password bytea NOT NULL,
    email character varying(120) NOT NULL,
    first_name character varying(30) NOT NULL,
    middle_name character varying(30) NOT NULL,
    last_name character varying(30) NOT NULL,
    static_roles integer NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: oauth2_grant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_grant ALTER COLUMN id SET DEFAULT nextval('public.oauth2_grant_id_seq'::regclass);


--
-- Name: oauth2_token id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_token ALTER COLUMN id SET DEFAULT nextval('public.oauth2_token_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Name: supplier id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier ALTER COLUMN id SET DEFAULT nextval('public.supplier_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
69886c8e4ee0
\.


--
-- Data for Name: oauth2_client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth2_client (client_id, client_secret, user_id, client_type, redirect_uris, default_scopes) FROM stdin;
docs	KQ()SWK)SQK)QWSKQW(SKQ)S(QWSQW(SJ*HQ&HQW*SQ*^SSQWSGQSG	12	public		auth:read auth:write users:read users:write  products:read products:write
\.


--
-- Data for Name: oauth2_grant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth2_grant (id, user_id, client_id, code, redirect_uri, expires, scopes) FROM stdin;
\.


--
-- Data for Name: oauth2_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth2_token (id, client_id, user_id, token_type, access_token, refresh_token, expires, scopes) FROM stdin;
7	docs	12	Bearer	RVw9V54m75AIM3S2qEYJwt4N6UeshT	u87OE94KaLGvaYlPZ5hn10GVdvPFGA	2032-04-27 02:53:38.832788	users:read
8	docs	12	Bearer	fKeYLcbPsbA1JyHTtoOCDn5qtkSaTD	c8j7hdQLRcnx7UoD7EIxEvcupQVZ6p	2032-04-27 02:54:57.185332	users:read
9	docs	12	Bearer	Hinz0e1Pwv1Gwd6Gr2JIM5k7MQCNm6	IAH14Dl1ztoOqGmXUqj8hIMjTxH2fm	2032-04-27 02:56:59.678041	teams:write
10	docs	12	Bearer	IKzCJpdF5jEJ8JTBBjUxY7inaMiRVj	jzkpYpnyzn02bdAerxuEnXxoqulemt	2032-04-27 09:06:57.813321	products:read
11	docs	12	Bearer	JnkjnHp1vBiHLq3tXedUcLy2pocH50	rIayMVJ0cELjKdIA1gaJvZPh81ykJv	2032-04-27 09:07:46.383478	products:write
12	docs	12	Bearer	qdAvgLXapRuEwTfW9UkKxypLP70dvh	mnIeMzjJ2xgOPMSpUfGY2iDO6CcDVx	2032-04-28 07:35:02.300289	products:write
13	docs	12	Bearer	9IcLU4hqopYMcTLnyFGB1Lv5d4kpeL	erfPHkgQglKXIcTAVsp82X5euhMV1N	2032-04-29 08:32:08.764571	users:write
14	docs	12	Bearer	YZ944i4FBcqYcTmTVKJSizs0oGzR4I	QrklgFNPiwwiTD7P3Ig2dxWvybLSHG	2032-04-29 08:36:57.215621	users:write
15	docs	12	Bearer	JZxH87ZsIm4fNqR8uoN9C4bzQgIiWr	yo06VV3R86FHUIv6rTi70N0N6eEc95	2032-05-12 08:07:49.073609	users:read
16	docs	12	Bearer	IwULcLXfJ0EbLqDCyFXdu2n2NwMQtM	8Q88DyP1iy4jW8PDL8FDHMN8EEJJc3	2032-05-12 08:13:58.864194	users:read
17	docs	12	Bearer	CXNz4FW1TsDKCWCgGXj89gpKuHmoFt	StmimxHnk74ZGcbHrje0Td7bAEMBGS	2032-05-12 08:15:53.591417	users:read
18	docs	12	Bearer	enrilsZ8qqIdmhPkMZwyy9RNEcjXSr	NByVga7Ki28fdxMbpPwJr5rzfmld97	2032-05-12 08:18:12.671628	users:read
19	docs	12	Bearer	hbqbX0kzKkW1KWU7QnsEsKM6dDo9hE	eMYJVn2E59IwlAi9YkbYU0YcL90D2O	2032-05-12 08:18:54.045806	users:read
20	docs	12	Bearer	TmqHeyAVK2e3NMKbhAABxsjfPJEM9N	w4bxUT7g9eFP1TuGTPatgs3Tb9B0Tj	2032-05-12 08:23:04.874745	users:read
21	docs	12	Bearer	38PqZjuPO4gv73hlROPZTLU5EpxPTy	a4V3re23sLsOTT9005a2ZFxGewyvM1	2032-05-12 08:23:32.595679	users:read
22	docs	12	Bearer	AAMylWmjVqQoMoSutY8bWfxNyXP2Gx	OJ88baLaSVeu1nBAXa9pYPwpTgFEdi	2032-05-12 08:25:06.224687	users:read
23	docs	12	Bearer	N5SxuaQesPOLPda9vhmGrUTcf0U9ft	cg3QYDIr87Jobw51608C7sQFU6xp6a	2032-05-12 08:32:28.97251	users:read
24	docs	12	Bearer	KfSu4vq1v7cuYnTYHIvUXZnqdlaWW9	G1PSaXu2Yl0nKjT6HuhgT6HWEKQDt7	2032-05-12 08:33:50.041132	users:read
25	docs	12	Bearer	iX9qCX4EFFJrtY9s21tsRdfsteIYcA	4J5ItEXerP7oMXwCfDXYrELipo7jVU	2032-05-12 08:41:33.744633	users:read
26	docs	12	Bearer	mHuGNvTVV3zZS0PpIUMAnfI6fSDDb1	rGogCW3Wllz0RSLDUFWqnBBQCITYfv	2032-05-12 08:44:34.099215	users:read
27	docs	12	Bearer	pzWNz0yXYml15BrcD4ROdOEeObgYHj	PLdF8bIS4ptUCuSeHs8H1hPtLr6Avb	2032-05-12 08:46:03.440571	users:read
28	docs	12	Bearer	r3RY5ZOze1rmhLkyZgbkLv6DFxXQyJ	PLjdpSmGrRg0fpp9miAkvuDON4vwcQ	2032-05-12 08:50:20.440617	users:read
29	docs	12	Bearer	ZocPaFDvmdB9Dh5dysoK54bLADRr9Y	tkNKvhbvpNi0xxQtJC4PFg80Ul3AiK	2032-05-12 08:52:27.408596	users:read
30	docs	12	Bearer	ut1dzI75lj6zbHYCCfug9QQKZaARk7	oOMqu6cy9O9HM0wxsjwXWORc40e558	2032-05-16 23:33:15.74902	auth:read
31	docs	12	Bearer	t9otkHL5XvNz4BONKwKaW5RztJnChs	gElLeNuxHxw1DShTBln0JctvXGq8P9	2032-05-18 08:26:49.589452	users:read
32	docs	12	Bearer	xQDJN0N6msBpZFYk8DZqhrfGOCVPjt	9A3U3Lwekz48XXtvizSiz1lYpsfDhf	2032-05-20 08:03:32.506185	users:read
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (created, updated, id, name, color, camera_behind_amount, camera_behind_feature, camera_behind_pixel, camera_selfie, os_name, os_version, price, ram, rom, screen_size, screen_tech) FROM stdin;
2020-12-01 16:00:47.036588	2020-12-19 07:18:38.68217	3	Iphone 12	green	2	chup xoa phong	12	7	iOS	14	2000	4	64	6.1	OLED
2020-12-03 14:50:39.666656	2020-12-19 07:18:38.68217	4	Iphone 12 Pro Max	blue	3	quay video 4K	12	7	iOS	14.1	2000	6	128	6.8	OLED
2020-12-03 14:51:24.060118	2020-12-19 07:18:38.68217	5	Iphone 12 Pro	white 	3	chup anh goc sieu rong	12	7	iOS	14.1	2000	6	256	5.8	OLED
\.


--
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (id, name, size, city) FROM stdin;
1	Apple	1000	California
2	Samsung	10000	Seoul
3	Oppo	5000	Bac Kinh
\.


--
-- Data for Name: supply_product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supply_product (sid, pid, quantity) FROM stdin;
1	3	10000
2	4	5890
1	5	6800
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (created, updated, id, username, password, email, first_name, middle_name, last_name, static_roles) FROM stdin;
2020-11-28 18:16:55.698424	2020-12-01 16:38:06.305335	12	root	\\x24326224313224526b31306b466d31673856385168343466544438584f473942336d4856752e594356745454356c6477432f64522f6653516f46786d	root@localhost	Nguyen	Quang	Huy	28672
\.


--
-- Name: oauth2_grant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.oauth2_grant_id_seq', 1, false);


--
-- Name: oauth2_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.oauth2_token_id_seq', 32, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 5, true);


--
-- Name: supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supplier_id_seq', 3, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 12, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: oauth2_client pk_oauth2_client; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_client
    ADD CONSTRAINT pk_oauth2_client PRIMARY KEY (client_id);


--
-- Name: oauth2_grant pk_oauth2_grant; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_grant
    ADD CONSTRAINT pk_oauth2_grant PRIMARY KEY (id);


--
-- Name: oauth2_token pk_oauth2_token; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_token
    ADD CONSTRAINT pk_oauth2_token PRIMARY KEY (id);


--
-- Name: product pk_product; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT pk_product PRIMARY KEY (id);


--
-- Name: supplier pk_supplier; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT pk_supplier PRIMARY KEY (id);


--
-- Name: supply_product pk_supply_product; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supply_product
    ADD CONSTRAINT pk_supply_product PRIMARY KEY (sid, pid);


--
-- Name: user pk_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT pk_user PRIMARY KEY (id);


--
-- Name: oauth2_token uq_oauth2_token_access_token; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_token
    ADD CONSTRAINT uq_oauth2_token_access_token UNIQUE (access_token);


--
-- Name: oauth2_token uq_oauth2_token_refresh_token; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_token
    ADD CONSTRAINT uq_oauth2_token_refresh_token UNIQUE (refresh_token);


--
-- Name: product uq_product_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT uq_product_id UNIQUE (id);


--
-- Name: supplier uq_supplier_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT uq_supplier_id UNIQUE (id);


--
-- Name: user uq_user_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT uq_user_email UNIQUE (email);


--
-- Name: user uq_user_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT uq_user_username UNIQUE (username);


--
-- Name: ix_oauth2_client_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth2_client_user_id ON public.oauth2_client USING btree (user_id);


--
-- Name: ix_oauth2_grant_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth2_grant_client_id ON public.oauth2_grant USING btree (client_id);


--
-- Name: ix_oauth2_grant_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth2_grant_code ON public.oauth2_grant USING btree (code);


--
-- Name: ix_oauth2_grant_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth2_grant_user_id ON public.oauth2_grant USING btree (user_id);


--
-- Name: ix_oauth2_token_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth2_token_client_id ON public.oauth2_token USING btree (client_id);


--
-- Name: ix_oauth2_token_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_oauth2_token_user_id ON public.oauth2_token USING btree (user_id);


--
-- Name: oauth2_client fk_oauth2_client_user_id_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_client
    ADD CONSTRAINT fk_oauth2_client_user_id_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: oauth2_grant fk_oauth2_grant_client_id_oauth2_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_grant
    ADD CONSTRAINT fk_oauth2_grant_client_id_oauth2_client FOREIGN KEY (client_id) REFERENCES public.oauth2_client(client_id);


--
-- Name: oauth2_grant fk_oauth2_grant_user_id_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_grant
    ADD CONSTRAINT fk_oauth2_grant_user_id_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: oauth2_token fk_oauth2_token_client_id_oauth2_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_token
    ADD CONSTRAINT fk_oauth2_token_client_id_oauth2_client FOREIGN KEY (client_id) REFERENCES public.oauth2_client(client_id);


--
-- Name: oauth2_token fk_oauth2_token_user_id_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth2_token
    ADD CONSTRAINT fk_oauth2_token_user_id_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: supply_product fk_supply_product_pid_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supply_product
    ADD CONSTRAINT fk_supply_product_pid_product FOREIGN KEY (pid) REFERENCES public.product(id);


--
-- Name: supply_product fk_supply_product_sid_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supply_product
    ADD CONSTRAINT fk_supply_product_sid_supplier FOREIGN KEY (sid) REFERENCES public.supplier(id);


--
-- PostgreSQL database dump complete
--

