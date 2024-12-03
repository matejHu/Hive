PGDMP               
    
    |         
   mydatabase    16.4    16.4 ;    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16400 
   mydatabase    DATABASE     }   CREATE DATABASE mydatabase WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Czech_Czechia.1250';
    DROP DATABASE mydatabase;
                postgres    false            �            1259    16581    box_location_history    TABLE     �   CREATE TABLE public.box_location_history (
    history_id integer NOT NULL,
    history_box_id integer NOT NULL,
    history_location_id integer NOT NULL,
    history_start_date date NOT NULL,
    history_end_date date
);
 (   DROP TABLE public.box_location_history;
       public         heap    postgres    false            �            1259    16580 #   box_location_history_history_id_seq    SEQUENCE     �   CREATE SEQUENCE public.box_location_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE public.box_location_history_history_id_seq;
       public          postgres    false    226            �           0    0 #   box_location_history_history_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE public.box_location_history_history_id_seq OWNED BY public.box_location_history.history_id;
          public          postgres    false    225            �            1259    16493    boxes    TABLE     �   CREATE TABLE public.boxes (
    box_id integer NOT NULL,
    box_type text,
    box_year integer,
    box_notes text,
    box_hive_id integer,
    box_user_id integer NOT NULL
);
    DROP TABLE public.boxes;
       public         heap    postgres    false            �            1259    16492    boxes_box_id_seq    SEQUENCE     �   CREATE SEQUENCE public.boxes_box_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.boxes_box_id_seq;
       public          postgres    false    216            �           0    0    boxes_box_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.boxes_box_id_seq OWNED BY public.boxes.box_id;
          public          postgres    false    215            �            1259    16507    checkups    TABLE     �   CREATE TABLE public.checkups (
    checkup_id integer NOT NULL,
    checkup_type text,
    checkup_flyby text,
    checkup_date date,
    checkup_note text,
    checkup_hive_id integer
);
    DROP TABLE public.checkups;
       public         heap    postgres    false            �            1259    16506    checkups_checkup_id_seq    SEQUENCE     �   CREATE SEQUENCE public.checkups_checkup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.checkups_checkup_id_seq;
       public          postgres    false    218            �           0    0    checkups_checkup_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.checkups_checkup_id_seq OWNED BY public.checkups.checkup_id;
          public          postgres    false    217            �            1259    16598    hive_location_history    TABLE     �   CREATE TABLE public.hive_location_history (
    history_id integer NOT NULL,
    history_hive_id integer NOT NULL,
    history_location_id integer NOT NULL,
    history_start_date date NOT NULL,
    history_end_date date
);
 )   DROP TABLE public.hive_location_history;
       public         heap    postgres    false            �            1259    16597 )   hive_location_history_hive_history_id_seq    SEQUENCE     �   CREATE SEQUENCE public.hive_location_history_hive_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 @   DROP SEQUENCE public.hive_location_history_hive_history_id_seq;
       public          postgres    false    228                        0    0 )   hive_location_history_hive_history_id_seq    SEQUENCE OWNED BY     r   ALTER SEQUENCE public.hive_location_history_hive_history_id_seq OWNED BY public.hive_location_history.history_id;
          public          postgres    false    227            �            1259    16536    hives    TABLE     �   CREATE TABLE public.hives (
    hive_id integer NOT NULL,
    hive_year integer,
    hive_name text,
    hive_user_id integer NOT NULL,
    hive_location_id integer
);
    DROP TABLE public.hives;
       public         heap    postgres    false            �            1259    16535    hives_hive_id_seq    SEQUENCE     �   CREATE SEQUENCE public.hives_hive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.hives_hive_id_seq;
       public          postgres    false    222                       0    0    hives_hive_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.hives_hive_id_seq OWNED BY public.hives.hive_id;
          public          postgres    false    221            �            1259    16552 	   locations    TABLE     �   CREATE TABLE public.locations (
    location_id integer NOT NULL,
    location_name text NOT NULL,
    location_user_id integer NOT NULL
);
    DROP TABLE public.locations;
       public         heap    postgres    false            �            1259    16551    locations_location_id_seq    SEQUENCE     �   CREATE SEQUENCE public.locations_location_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.locations_location_id_seq;
       public          postgres    false    224                       0    0    locations_location_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.locations_location_id_seq OWNED BY public.locations.location_id;
          public          postgres    false    223            �            1259    16521    mothers    TABLE     �   CREATE TABLE public.mothers (
    mother_id integer NOT NULL,
    mother_origin text,
    mother_year integer,
    mother_notes text,
    mother_hive_id integer,
    mother_user_id integer NOT NULL
);
    DROP TABLE public.mothers;
       public         heap    postgres    false            �            1259    16520    mothers_mother_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mothers_mother_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.mothers_mother_id_seq;
       public          postgres    false    220                       0    0    mothers_mother_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.mothers_mother_id_seq OWNED BY public.mothers.mother_id;
          public          postgres    false    219            �            1259    16615 
   production    TABLE     �   CREATE TABLE public.production (
    production_id integer NOT NULL,
    production_hive_id integer NOT NULL,
    production_volume integer,
    production_date date NOT NULL,
    production_type text,
    production_note text
);
    DROP TABLE public.production;
       public         heap    postgres    false            �            1259    16614    production_production_id_seq    SEQUENCE     �   CREATE SEQUENCE public.production_production_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.production_production_id_seq;
       public          postgres    false    230                       0    0    production_production_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.production_production_id_seq OWNED BY public.production.production_id;
          public          postgres    false    229            �            1259    16638    users    TABLE     �   CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    email character varying(50) NOT NULL
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    16645    users_user_id_seq    SEQUENCE     �   ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    231            G           2604    16584    box_location_history history_id    DEFAULT     �   ALTER TABLE ONLY public.box_location_history ALTER COLUMN history_id SET DEFAULT nextval('public.box_location_history_history_id_seq'::regclass);
 N   ALTER TABLE public.box_location_history ALTER COLUMN history_id DROP DEFAULT;
       public          postgres    false    225    226    226            B           2604    16496    boxes box_id    DEFAULT     l   ALTER TABLE ONLY public.boxes ALTER COLUMN box_id SET DEFAULT nextval('public.boxes_box_id_seq'::regclass);
 ;   ALTER TABLE public.boxes ALTER COLUMN box_id DROP DEFAULT;
       public          postgres    false    215    216    216            C           2604    16510    checkups checkup_id    DEFAULT     z   ALTER TABLE ONLY public.checkups ALTER COLUMN checkup_id SET DEFAULT nextval('public.checkups_checkup_id_seq'::regclass);
 B   ALTER TABLE public.checkups ALTER COLUMN checkup_id DROP DEFAULT;
       public          postgres    false    217    218    218            H           2604    16601     hive_location_history history_id    DEFAULT     �   ALTER TABLE ONLY public.hive_location_history ALTER COLUMN history_id SET DEFAULT nextval('public.hive_location_history_hive_history_id_seq'::regclass);
 O   ALTER TABLE public.hive_location_history ALTER COLUMN history_id DROP DEFAULT;
       public          postgres    false    227    228    228            E           2604    16539    hives hive_id    DEFAULT     n   ALTER TABLE ONLY public.hives ALTER COLUMN hive_id SET DEFAULT nextval('public.hives_hive_id_seq'::regclass);
 <   ALTER TABLE public.hives ALTER COLUMN hive_id DROP DEFAULT;
       public          postgres    false    222    221    222            F           2604    16555    locations location_id    DEFAULT     ~   ALTER TABLE ONLY public.locations ALTER COLUMN location_id SET DEFAULT nextval('public.locations_location_id_seq'::regclass);
 D   ALTER TABLE public.locations ALTER COLUMN location_id DROP DEFAULT;
       public          postgres    false    223    224    224            D           2604    16524    mothers mother_id    DEFAULT     v   ALTER TABLE ONLY public.mothers ALTER COLUMN mother_id SET DEFAULT nextval('public.mothers_mother_id_seq'::regclass);
 @   ALTER TABLE public.mothers ALTER COLUMN mother_id DROP DEFAULT;
       public          postgres    false    220    219    220            I           2604    16618    production production_id    DEFAULT     �   ALTER TABLE ONLY public.production ALTER COLUMN production_id SET DEFAULT nextval('public.production_production_id_seq'::regclass);
 G   ALTER TABLE public.production ALTER COLUMN production_id DROP DEFAULT;
       public          postgres    false    229    230    230            V           2606    16586 .   box_location_history box_location_history_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.box_location_history
    ADD CONSTRAINT box_location_history_pkey PRIMARY KEY (history_id);
 X   ALTER TABLE ONLY public.box_location_history DROP CONSTRAINT box_location_history_pkey;
       public            postgres    false    226            L           2606    16500    boxes boxes_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.boxes
    ADD CONSTRAINT boxes_pkey PRIMARY KEY (box_id);
 :   ALTER TABLE ONLY public.boxes DROP CONSTRAINT boxes_pkey;
       public            postgres    false    216            J           2606    16658    users check_password    CHECK CONSTRAINT     �   ALTER TABLE public.users
    ADD CONSTRAINT check_password CHECK (((password)::text ~ '^(?=.*[a-zA-Z])(?=.*\d).+$'::text)) NOT VALID;
 9   ALTER TABLE public.users DROP CONSTRAINT check_password;
       public          postgres    false    231    231            N           2606    16514    checkups checkups_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.checkups
    ADD CONSTRAINT checkups_pkey PRIMARY KEY (checkup_id);
 @   ALTER TABLE ONLY public.checkups DROP CONSTRAINT checkups_pkey;
       public            postgres    false    218            X           2606    16603 .   hive_location_history hive_location_history_id 
   CONSTRAINT     t   ALTER TABLE ONLY public.hive_location_history
    ADD CONSTRAINT hive_location_history_id PRIMARY KEY (history_id);
 X   ALTER TABLE ONLY public.hive_location_history DROP CONSTRAINT hive_location_history_id;
       public            postgres    false    228            R           2606    16543    hives hives_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.hives
    ADD CONSTRAINT hives_pkey PRIMARY KEY (hive_id);
 :   ALTER TABLE ONLY public.hives DROP CONSTRAINT hives_pkey;
       public            postgres    false    222            T           2606    16559    locations locations_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (location_id);
 B   ALTER TABLE ONLY public.locations DROP CONSTRAINT locations_pkey;
       public            postgres    false    224            P           2606    16528    mothers mothers_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.mothers
    ADD CONSTRAINT mothers_pkey PRIMARY KEY (mother_id);
 >   ALTER TABLE ONLY public.mothers DROP CONSTRAINT mothers_pkey;
       public            postgres    false    220            Z           2606    16622    production production_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY public.production
    ADD CONSTRAINT production_pkey PRIMARY KEY (production_id);
 D   ALTER TABLE ONLY public.production DROP CONSTRAINT production_pkey;
       public            postgres    false    230            \           2606    16644    users users_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    231            ]           2606    16660    boxes box_user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.boxes
    ADD CONSTRAINT box_user_id FOREIGN KEY (box_user_id) REFERENCES public.users(user_id) NOT VALID;
 ;   ALTER TABLE ONLY public.boxes DROP CONSTRAINT box_user_id;
       public          postgres    false    4700    231    216            ^           2606    16687    checkups checkup_hive_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.checkups
    ADD CONSTRAINT checkup_hive_id FOREIGN KEY (checkup_hive_id) REFERENCES public.hives(hive_id) NOT VALID;
 B   ALTER TABLE ONLY public.checkups DROP CONSTRAINT checkup_hive_id;
       public          postgres    false    4690    222    218            c           2606    16587 &   box_location_history fk_history_box_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.box_location_history
    ADD CONSTRAINT fk_history_box_id FOREIGN KEY (history_box_id) REFERENCES public.boxes(box_id) ON DELETE SET NULL;
 P   ALTER TABLE ONLY public.box_location_history DROP CONSTRAINT fk_history_box_id;
       public          postgres    false    226    216    4684            d           2606    16592 +   box_location_history fk_history_location_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.box_location_history
    ADD CONSTRAINT fk_history_location_id FOREIGN KEY (history_location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL;
 U   ALTER TABLE ONLY public.box_location_history DROP CONSTRAINT fk_history_location_id;
       public          postgres    false    4692    226    224            e           2606    16604 3   hive_location_history hive_history_location_hive_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.hive_location_history
    ADD CONSTRAINT hive_history_location_hive_id FOREIGN KEY (history_hive_id) REFERENCES public.hives(hive_id) ON DELETE SET NULL;
 ]   ALTER TABLE ONLY public.hive_location_history DROP CONSTRAINT hive_history_location_hive_id;
       public          postgres    false    222    4690    228            f           2606    16609 .   hive_location_history hive_history_location_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.hive_location_history
    ADD CONSTRAINT hive_history_location_id FOREIGN KEY (history_location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.hive_location_history DROP CONSTRAINT hive_history_location_id;
       public          postgres    false    228    224    4692            `           2606    16682    hives hive_location_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.hives
    ADD CONSTRAINT hive_location_id FOREIGN KEY (hive_location_id) REFERENCES public.locations(location_id) NOT VALID;
 @   ALTER TABLE ONLY public.hives DROP CONSTRAINT hive_location_id;
       public          postgres    false    4692    224    222            a           2606    16665    hives hive_user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.hives
    ADD CONSTRAINT hive_user_id FOREIGN KEY (hive_user_id) REFERENCES public.users(user_id) NOT VALID;
 <   ALTER TABLE ONLY public.hives DROP CONSTRAINT hive_user_id;
       public          postgres    false    231    222    4700            b           2606    16670    locations location_user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.locations
    ADD CONSTRAINT location_user_id FOREIGN KEY (location_user_id) REFERENCES public.users(user_id) NOT VALID;
 D   ALTER TABLE ONLY public.locations DROP CONSTRAINT location_user_id;
       public          postgres    false    224    231    4700            _           2606    16675    mothers mother_user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.mothers
    ADD CONSTRAINT mother_user_id FOREIGN KEY (mother_user_id) REFERENCES public.users(user_id) NOT VALID;
 @   ALTER TABLE ONLY public.mothers DROP CONSTRAINT mother_user_id;
       public          postgres    false    4700    231    220            g           2606    16633    production production_box_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.production
    ADD CONSTRAINT production_box_id FOREIGN KEY (production_hive_id) REFERENCES public.boxes(box_id) ON DELETE SET NULL NOT VALID;
 F   ALTER TABLE ONLY public.production DROP CONSTRAINT production_box_id;
       public          postgres    false    4684    216    230           