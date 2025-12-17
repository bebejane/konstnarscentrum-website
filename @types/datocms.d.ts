type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BooleanType: any;
  CustomData: any;
  Date: any;
  DateTime: any;
  FloatType: any;
  IntType: any;
  ItemId: any;
  JsonField: any;
  MetaTagAttributes: any;
  UploadId: any;
};

type AboutModelContentBlocksField = ButtonRecord | ImageRecord | VideoRecord;

type AboutModelContentField = {
  __typename?: 'AboutModelContentField';
  blocks: Array<AboutModelContentBlocksField>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

type AboutModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<AboutModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AboutModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  content?: InputMaybe<StructuredTextFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  intro?: InputMaybe<TextFilter>;
  position?: InputMaybe<PositionFilter>;
  showImage?: InputMaybe<BooleanFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum AboutModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  showImage_ASC = 'showImage_ASC',
  showImage_DESC = 'showImage_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Om (about) */
type AboutRecord = RecordInterface & {
  __typename?: 'AboutRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  content: AboutModelContentField;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  intro: Scalars['String'];
  position?: Maybe<Scalars['IntType']>;
  showImage?: Maybe<Scalars['BooleanType']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Om (about) */
type AboutRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Om (about) */
type AboutRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type ActivityModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<ActivityModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ActivityModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  intro?: InputMaybe<TextFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
  var?: InputMaybe<StringFilter>;
  when?: InputMaybe<DateFilter>;
};

enum ActivityModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
  var_ASC = 'var_ASC',
  var_DESC = 'var_DESC',
  when_ASC = 'when_ASC',
  when_DESC = 'when_DESC'
}

/** Record of type Aktivitet (activity) */
type ActivityRecord = RecordInterface & {
  __typename?: 'ActivityRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image: FileField;
  intro: Scalars['String'];
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  var: Scalars['String'];
  when: Scalars['Date'];
};


/** Record of type Aktivitet (activity) */
type ActivityRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Aktivitet (activity) */
type ActivityRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type ApplicationModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<ApplicationModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ApplicationModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  address?: InputMaybe<TextFilter>;
  approvalToken?: InputMaybe<StringFilter>;
  approved?: InputMaybe<BooleanFilter>;
  birthYear?: InputMaybe<IntegerFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  education?: InputMaybe<TextFilter>;
  email?: InputMaybe<StringFilter>;
  firstName?: InputMaybe<StringFilter>;
  homeCity?: InputMaybe<StringFilter>;
  id?: InputMaybe<ItemIdFilter>;
  lastName?: InputMaybe<StringFilter>;
  message?: InputMaybe<TextFilter>;
  pdf?: InputMaybe<FileFilter>;
  phone?: InputMaybe<StringFilter>;
  region?: InputMaybe<LinkFilter>;
  sex?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
  webpage?: InputMaybe<StringFilter>;
};

enum ApplicationModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  approvalToken_ASC = 'approvalToken_ASC',
  approvalToken_DESC = 'approvalToken_DESC',
  approved_ASC = 'approved_ASC',
  approved_DESC = 'approved_DESC',
  birthYear_ASC = 'birthYear_ASC',
  birthYear_DESC = 'birthYear_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  email_ASC = 'email_ASC',
  email_DESC = 'email_DESC',
  firstName_ASC = 'firstName_ASC',
  firstName_DESC = 'firstName_DESC',
  homeCity_ASC = 'homeCity_ASC',
  homeCity_DESC = 'homeCity_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  lastName_ASC = 'lastName_ASC',
  lastName_DESC = 'lastName_DESC',
  phone_ASC = 'phone_ASC',
  phone_DESC = 'phone_DESC',
  sex_ASC = 'sex_ASC',
  sex_DESC = 'sex_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
  webpage_ASC = 'webpage_ASC',
  webpage_DESC = 'webpage_DESC'
}

/** Record of type Ansökning (application) */
type ApplicationRecord = RecordInterface & {
  __typename?: 'ApplicationRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  address?: Maybe<Scalars['String']>;
  approvalToken?: Maybe<Scalars['String']>;
  approved?: Maybe<Scalars['BooleanType']>;
  birthYear?: Maybe<Scalars['IntType']>;
  createdAt: Scalars['DateTime'];
  education?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  firstName: Scalars['String'];
  homeCity?: Maybe<Scalars['String']>;
  id: Scalars['ItemId'];
  lastName: Scalars['String'];
  message: Scalars['String'];
  pdf?: Maybe<FileField>;
  phone?: Maybe<Scalars['String']>;
  region: RegionRecord;
  sex?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  webpage?: Maybe<Scalars['String']>;
};


/** Record of type Ansökning (application) */
type ApplicationRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Ansökning (application) */
type ApplicationRecordaddressArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};


/** Record of type Ansökning (application) */
type ApplicationRecordeducationArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};


/** Record of type Ansökning (application) */
type ApplicationRecordmessageArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type ApplyModelContentField = {
  __typename?: 'ApplyModelContentField';
  blocks: Array<ButtonRecord>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

/** Record of type Bli medlem (apply) */
type ApplyRecord = RecordInterface & {
  __typename?: 'ApplyRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  content: ApplyModelContentField;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  intro?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Bli medlem (apply) */
type ApplyRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Bli medlem (apply) */
type ApplyRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type BoardModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<BoardModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<BoardModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<ItemIdFilter>;
  name?: InputMaybe<StringFilter>;
  position?: InputMaybe<PositionFilter>;
  region?: InputMaybe<LinkFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum BoardModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  email_ASC = 'email_ASC',
  email_DESC = 'email_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  name_ASC = 'name_ASC',
  name_DESC = 'name_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Styrelse (board) */
type BoardRecord = RecordInterface & {
  __typename?: 'BoardRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['ItemId'];
  name: Scalars['String'];
  position?: Maybe<Scalars['IntType']>;
  region: RegionRecord;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Styrelse (board) */
type BoardRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter Boolean fields */
type BooleanFilter = {
  /** Search for records with an exact match */
  eq?: InputMaybe<Scalars['BooleanType']>;
};

/** Block of type Knapp (button) */
type ButtonRecord = RecordInterface & {
  __typename?: 'ButtonRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  text: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  url: Scalars['String'];
};


/** Block of type Knapp (button) */
type ButtonRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type CollectionMetadata = {
  __typename?: 'CollectionMetadata';
  count: Scalars['IntType'];
};

enum ColorBucketType {
  black = 'black',
  blue = 'blue',
  brown = 'brown',
  cyan = 'cyan',
  green = 'green',
  grey = 'grey',
  orange = 'orange',
  pink = 'pink',
  purple = 'purple',
  red = 'red',
  white = 'white',
  yellow = 'yellow'
}

type ColorField = {
  __typename?: 'ColorField';
  alpha: Scalars['IntType'];
  blue: Scalars['IntType'];
  cssRgb: Scalars['String'];
  green: Scalars['IntType'];
  hex: Scalars['String'];
  red: Scalars['IntType'];
};

type CommissionCategoryModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<CommissionCategoryModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CommissionCategoryModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum CommissionCategoryModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Uppdragskategori (commission_category) */
type CommissionCategoryRecord = RecordInterface & {
  __typename?: 'CommissionCategoryRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Uppdragskategori (commission_category) */
type CommissionCategoryRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type CommissionModelContentField = ImageRecord | VideoRecord;

type CommissionModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<CommissionModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CommissionModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  artist?: InputMaybe<StringFilter>;
  blackHeadline?: InputMaybe<BooleanFilter>;
  category?: InputMaybe<LinkFilter>;
  city?: InputMaybe<StringFilter>;
  commissioner?: InputMaybe<StringFilter>;
  consultant?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  intro?: InputMaybe<TextFilter>;
  region?: InputMaybe<LinkFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
  work?: InputMaybe<StringFilter>;
  year?: InputMaybe<StringFilter>;
};

enum CommissionModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  artist_ASC = 'artist_ASC',
  artist_DESC = 'artist_DESC',
  blackHeadline_ASC = 'blackHeadline_ASC',
  blackHeadline_DESC = 'blackHeadline_DESC',
  city_ASC = 'city_ASC',
  city_DESC = 'city_DESC',
  commissioner_ASC = 'commissioner_ASC',
  commissioner_DESC = 'commissioner_DESC',
  consultant_ASC = 'consultant_ASC',
  consultant_DESC = 'consultant_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
  work_ASC = 'work_ASC',
  work_DESC = 'work_DESC',
  year_ASC = 'year_ASC',
  year_DESC = 'year_DESC'
}

/** Record of type Uppdrag (commission) */
type CommissionRecord = RecordInterface & {
  __typename?: 'CommissionRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  artist: Scalars['String'];
  blackHeadline?: Maybe<Scalars['BooleanType']>;
  category: CommissionCategoryRecord;
  city: Scalars['String'];
  commissioner?: Maybe<Scalars['String']>;
  consultant: Scalars['String'];
  content: Array<CommissionModelContentField>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  intro: Scalars['String'];
  region: RegionRecord;
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  work?: Maybe<Scalars['String']>;
  year: Scalars['String'];
};


/** Record of type Uppdrag (commission) */
type CommissionRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Uppdrag (commission) */
type CommissionRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type ConsultModelContentBlocksField = ButtonRecord | GalleryRecord | ImageRecord | VideoRecord;

type ConsultModelContentField = {
  __typename?: 'ConsultModelContentField';
  blocks: Array<ConsultModelContentBlocksField>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

type ConsultModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<ConsultModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ConsultModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  blackHeadline?: InputMaybe<BooleanFilter>;
  content?: InputMaybe<StructuredTextFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  intro?: InputMaybe<TextFilter>;
  position?: InputMaybe<PositionFilter>;
  showImage?: InputMaybe<BooleanFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum ConsultModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  blackHeadline_ASC = 'blackHeadline_ASC',
  blackHeadline_DESC = 'blackHeadline_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  showImage_ASC = 'showImage_ASC',
  showImage_DESC = 'showImage_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Anlita oss (consult) */
type ConsultRecord = RecordInterface & {
  __typename?: 'ConsultRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  blackHeadline?: Maybe<Scalars['BooleanType']>;
  content: ConsultModelContentField;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  intro: Scalars['String'];
  position?: Maybe<Scalars['IntType']>;
  showImage?: Maybe<Scalars['BooleanType']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Anlita oss (consult) */
type ConsultRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Anlita oss (consult) */
type ConsultRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type ConsultantModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<ConsultantModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ConsultantModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<ItemIdFilter>;
  name?: InputMaybe<StringFilter>;
  position?: InputMaybe<PositionFilter>;
  region?: InputMaybe<LinkFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum ConsultantModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  email_ASC = 'email_ASC',
  email_DESC = 'email_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  name_ASC = 'name_ASC',
  name_DESC = 'name_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Konstkonsulter (consultant) */
type ConsultantRecord = RecordInterface & {
  __typename?: 'ConsultantRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['ItemId'];
  name: Scalars['String'];
  position?: Maybe<Scalars['IntType']>;
  region: RegionRecord;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Konstkonsulter (consultant) */
type ConsultantRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Record of type Kontakt ingress (contact_intro) */
type ContactIntroRecord = RecordInterface & {
  __typename?: 'ContactIntroRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  board?: Maybe<Scalars['String']>;
  consultant?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  staff?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Kontakt ingress (contact_intro) */
type ContactIntroRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Kontakt ingress (contact_intro) */
type ContactIntroRecordboardArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};


/** Record of type Kontakt ingress (contact_intro) */
type ContactIntroRecordconsultantArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};


/** Record of type Kontakt ingress (contact_intro) */
type ContactIntroRecordstaffArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Block of type Kontakt (contact) */
type ContactRecord = RecordInterface & {
  __typename?: 'ContactRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  address?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  email?: Maybe<Scalars['String']>;
  id: Scalars['ItemId'];
  phone?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Kontakt (contact) */
type ContactRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Block of type Kontakt (contact) */
type ContactRecordaddressArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type ContentModelLayoutField = {
  __typename?: 'ContentModelLayoutField';
  blocks: Array<Scalars['String']>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

/** Block of type Innehåll (content) */
type ContentRecord = RecordInterface & {
  __typename?: 'ContentRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  layout?: Maybe<ContentModelLayoutField>;
  slug?: Maybe<Scalars['String']>;
  subTitle?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Innehåll (content) */
type ContentRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter by creation datetime */
type CreatedAtFilter = {
  /** Filter records with a value that's within the specified minute range. Seconds and milliseconds are truncated from the argument. */
  eq?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with a value that's strictly greater than the one specified. Seconds and milliseconds are truncated from the argument. */
  gt?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's greater than or equal to than the one specified. Seconds and milliseconds are truncated from the argument. */
  gte?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's less than the one specified. Seconds and milliseconds are truncated from the argument. */
  lt?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's less or equal than the one specified. Seconds and milliseconds are truncated from the argument. */
  lte?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's outside the specified minute range. Seconds and milliseconds are truncated from the argument. */
  neq?: InputMaybe<Scalars['DateTime']>;
};

/** Specifies how to filter Date fields */
type DateFilter = {
  /** Search for records with an exact match */
  eq?: InputMaybe<Scalars['Date']>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with a value that's strictly greater than the one specified */
  gt?: InputMaybe<Scalars['Date']>;
  /** Filter records with a value that's greater than or equal to the one specified */
  gte?: InputMaybe<Scalars['Date']>;
  /** Filter records with a value that's less than the one specified */
  lt?: InputMaybe<Scalars['Date']>;
  /** Filter records with a value that's less or equal than the one specified */
  lte?: InputMaybe<Scalars['Date']>;
  /** Exclude records with an exact match */
  neq?: InputMaybe<Scalars['Date']>;
};

type EmployeeModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<EmployeeModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<EmployeeModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<ItemIdFilter>;
  name?: InputMaybe<StringFilter>;
  position?: InputMaybe<PositionFilter>;
  region?: InputMaybe<LinkFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum EmployeeModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  email_ASC = 'email_ASC',
  email_DESC = 'email_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  name_ASC = 'name_ASC',
  name_DESC = 'name_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Personal (employee) */
type EmployeeRecord = RecordInterface & {
  __typename?: 'EmployeeRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['ItemId'];
  name: Scalars['String'];
  position?: Maybe<Scalars['IntType']>;
  region: RegionRecord;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Personal (employee) */
type EmployeeRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

enum FaviconType {
  appleTouchIcon = 'appleTouchIcon',
  icon = 'icon',
  msApplication = 'msApplication'
}

type FileField = FileFieldInterface & {
  __typename?: 'FileField';
  _createdAt: Scalars['DateTime'];
  /** The DatoCMS URL where you can edit this entity. To use this field, you need to set a X-Base-Editing-Url header in the request */
  _editingUrl?: Maybe<Scalars['String']>;
  _updatedAt: Scalars['DateTime'];
  alt?: Maybe<Scalars['String']>;
  author?: Maybe<Scalars['String']>;
  basename: Scalars['String'];
  blurUpThumb?: Maybe<Scalars['String']>;
  blurhash?: Maybe<Scalars['String']>;
  colors: Array<ColorField>;
  copyright?: Maybe<Scalars['String']>;
  customData: Scalars['CustomData'];
  exifInfo: Scalars['CustomData'];
  filename: Scalars['String'];
  focalPoint?: Maybe<focalPoint>;
  format: Scalars['String'];
  height?: Maybe<Scalars['IntType']>;
  id: Scalars['UploadId'];
  md5: Scalars['String'];
  mimeType: Scalars['String'];
  notes?: Maybe<Scalars['String']>;
  responsiveImage?: Maybe<ResponsiveImage>;
  size: Scalars['IntType'];
  smartTags: Array<Scalars['String']>;
  tags: Array<Scalars['String']>;
  thumbhash?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  url: Scalars['String'];
  video?: Maybe<UploadVideoField>;
  width?: Maybe<Scalars['IntType']>;
};


type FileFieldaltArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldblurUpThumbArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
  punch?: Scalars['Float'];
  quality?: Scalars['Int'];
  size?: Scalars['Int'];
};


type FileFieldcustomDataArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldfocalPointArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldresponsiveImageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  imgixParams?: InputMaybe<ImgixParams>;
  locale?: InputMaybe<SiteLocale>;
  sizes?: InputMaybe<Scalars['String']>;
};


type FileFieldtitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldurlArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
};

type FileFieldInterface = {
  _createdAt: Scalars['DateTime'];
  /** The DatoCMS URL where you can edit this entity. To use this field, you need to set a X-Base-Editing-Url header in the request */
  _editingUrl?: Maybe<Scalars['String']>;
  _updatedAt: Scalars['DateTime'];
  alt?: Maybe<Scalars['String']>;
  author?: Maybe<Scalars['String']>;
  basename: Scalars['String'];
  blurUpThumb?: Maybe<Scalars['String']>;
  blurhash?: Maybe<Scalars['String']>;
  colors: Array<ColorField>;
  copyright?: Maybe<Scalars['String']>;
  customData: Scalars['CustomData'];
  exifInfo: Scalars['CustomData'];
  filename: Scalars['String'];
  focalPoint?: Maybe<focalPoint>;
  format: Scalars['String'];
  height?: Maybe<Scalars['IntType']>;
  id: Scalars['UploadId'];
  md5: Scalars['String'];
  mimeType: Scalars['String'];
  notes?: Maybe<Scalars['String']>;
  responsiveImage?: Maybe<ResponsiveImage>;
  size: Scalars['IntType'];
  smartTags: Array<Scalars['String']>;
  tags: Array<Scalars['String']>;
  thumbhash?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  url: Scalars['String'];
  video?: Maybe<UploadVideoField>;
  width?: Maybe<Scalars['IntType']>;
};


type FileFieldInterfacealtArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldInterfaceblurUpThumbArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
  punch?: Scalars['Float'];
  quality?: Scalars['Int'];
  size?: Scalars['Int'];
};


type FileFieldInterfacecustomDataArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldInterfacefocalPointArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldInterfaceresponsiveImageArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  imgixParams?: InputMaybe<ImgixParams>;
  locale?: InputMaybe<SiteLocale>;
  sizes?: InputMaybe<Scalars['String']>;
};


type FileFieldInterfacetitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type FileFieldInterfaceurlArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
};

/** Specifies how to filter Single-file/image fields */
type FileFilter = {
  /** Search for records with an exact match. The specified value must be an Upload ID */
  eq?: InputMaybe<Scalars['UploadId']>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records that have one of the specified uploads */
  in?: InputMaybe<Array<InputMaybe<Scalars['UploadId']>>>;
  /** Exclude records with an exact match. The specified value must be an Upload ID */
  neq?: InputMaybe<Scalars['UploadId']>;
  /** Filter records that do not have one of the specified uploads */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['UploadId']>>>;
};

/** Record of type Sidfot (footer) */
type FooterRecord = RecordInterface & {
  __typename?: 'FooterRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  aboutKc: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Sidfot (footer) */
type FooterRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Sidfot (footer) */
type FooterRecordaboutKcArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type ForArtistModelContentBlocksField = ButtonRecord | ImageRecord | VideoRecord;

type ForArtistModelContentField = {
  __typename?: 'ForArtistModelContentField';
  blocks: Array<ForArtistModelContentBlocksField>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

type ForArtistModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<ForArtistModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ForArtistModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  content?: InputMaybe<StructuredTextFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  intro?: InputMaybe<TextFilter>;
  position?: InputMaybe<PositionFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum ForArtistModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type För konstnärer (for_artist) */
type ForArtistRecord = RecordInterface & {
  __typename?: 'ForArtistRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  content?: Maybe<ForArtistModelContentField>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  intro?: Maybe<Scalars['String']>;
  position?: Maybe<Scalars['IntType']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type För konstnärer (for_artist) */
type ForArtistRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type För konstnärer (for_artist) */
type ForArtistRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

type FormModelFormFieldsField = FormTextRecord | FormTextblockRecord | PdfFormRecord;

/** Block of type Formulär (form) */
type FormRecord = RecordInterface & {
  __typename?: 'FormRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  confirmation: Scalars['String'];
  createdAt: Scalars['DateTime'];
  formFields: Array<FormModelFormFieldsField>;
  id: Scalars['ItemId'];
  reciever?: Maybe<Scalars['String']>;
  subject?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Formulär (form) */
type FormRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Block of type Textfält (form_text) */
type FormTextRecord = RecordInterface & {
  __typename?: 'FormTextRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Textfält (form_text) */
type FormTextRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Block of type Textblock (form_textblock) */
type FormTextblockRecord = RecordInterface & {
  __typename?: 'FormTextblockRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Textblock (form_textblock) */
type FormTextblockRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Block of type Galleri (gallery) */
type GalleryRecord = RecordInterface & {
  __typename?: 'GalleryRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  images: Array<FileField>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Galleri (gallery) */
type GalleryRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type GlobalSeoField = {
  __typename?: 'GlobalSeoField';
  facebookPageUrl?: Maybe<Scalars['String']>;
  fallbackSeo?: Maybe<SeoField>;
  siteName?: Maybe<Scalars['String']>;
  titleSuffix?: Maybe<Scalars['String']>;
  twitterAccount?: Maybe<Scalars['String']>;
};

type HelpModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<HelpModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<HelpModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  model?: InputMaybe<StringFilter>;
  position?: InputMaybe<PositionFilter>;
  text?: InputMaybe<TextFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum HelpModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  model_ASC = 'model_ASC',
  model_DESC = 'model_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Hjälp (help) */
type HelpRecord = RecordInterface & {
  __typename?: 'HelpRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  model: Scalars['String'];
  position?: Maybe<Scalars['IntType']>;
  text: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Hjälp (help) */
type HelpRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Hjälp (help) */
type HelpRecordtextArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Block of type Bild(er) (image) */
type ImageRecord = RecordInterface & {
  __typename?: 'ImageRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image: Array<FileField>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Bild(er) (image) */
type ImageRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Block of type Bildgenväg (image_shortcut) */
type ImageShortcutRecord = RecordInterface & {
  __typename?: 'ImageShortcutRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  blackHeadline?: Maybe<Scalars['BooleanType']>;
  createdAt: Scalars['DateTime'];
  headline?: Maybe<Scalars['String']>;
  id: Scalars['ItemId'];
  image: FileField;
  link?: Maybe<Scalars['String']>;
  text?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Bildgenväg (image_shortcut) */
type ImageShortcutRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type ImgixParams = {
  /**
   * Aspect Ratio
   *
   * Specifies an aspect ratio to maintain when resizing and cropping the image
   *
   * Depends on: `fit=crop`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/aspect-ratio)
   */
  ar?: InputMaybe<Scalars['String']>;
  /**
   * Automatic
   *
   * Applies automatic enhancements to images.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/automatic)
   */
  auto?: InputMaybe<Array<ImgixParamsAuto>>;
  /**
   * Background Color
   *
   * Colors the background of padded and partially-transparent images.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/background-color)
   */
  bg?: InputMaybe<Scalars['String']>;
  /**
   * Background Removal
   *
   * Removes background from image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/background/background-removal)
   */
  bgRemove?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Background Removal Fallback
   *
   * Overrides default fallback behavior for bg-remove failures.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/background/background-removal-fallback)
   */
  bgRemoveFallback?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Background Removal Foreground Type
   *
   * Specifies the image foreground type for background removal.
   *
   * Depends on: `bg-remove=true`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/background/background-removal-foreground-type)
   */
  bgRemoveFgType?: InputMaybe<Array<ImgixParamsBgRemoveFgType>>;
  /**
   * Background Removal Semi Transparency
   *
   * Enables background removal while retaining semi-transparent areas.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/background/background-removal-semi-transparency)
   */
  bgRemoveSemiTransparency?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Background Replacement
   *
   * Replaces background from image using a string based prompt.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/background/background-replacement)
   */
  bgReplace?: InputMaybe<Scalars['String']>;
  /**
   * Background Replace Fallback
   *
   * Overrides default fallback behavior for bg-replace failures.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/background/background-replace-fallback)
   */
  bgReplaceFallback?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Background Replacement Negative Prompt
   *
   * Provides a negative text suggestion for background replacement.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/background/background-replacement-negative-prompt)
   */
  bgReplaceNegPrompt?: InputMaybe<Scalars['String']>;
  /**
   * Blend
   *
   * Specifies the location of the blend image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend)
   */
  blend?: InputMaybe<Scalars['String']>;
  /**
   * Blend Align
   *
   * Changes the blend alignment relative to the parent image.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-align)
   */
  blendAlign?: InputMaybe<Array<ImgixParamsBlendAlign>>;
  /**
   * Blend Alpha
   *
   * Changes the alpha of the blend image.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-alpha)
   */
  blendAlpha?: InputMaybe<Scalars['IntType']>;
  /**
   * Blend Color
   *
   * Specifies a color to use when applying the blend.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-color)
   */
  blendColor?: InputMaybe<Scalars['String']>;
  /**
   * Blend Crop
   *
   * Specifies the type of crop for blend images.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-crop)
   */
  blendCrop?: InputMaybe<Array<ImgixParamsBlendCrop>>;
  /**
   * Blend Fit
   *
   * Specifies the fit mode for blend images.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-fit)
   */
  blendFit?: InputMaybe<ImgixParamsBlendFit>;
  /**
   * Blend Height
   *
   * Adjusts the height of the blend image.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-height)
   */
  blendH?: InputMaybe<Scalars['FloatType']>;
  /**
   * Blend Mode
   *
   * Sets the blend mode for a blend image.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-mode)
   */
  blendMode?: InputMaybe<ImgixParamsBlendMode>;
  /**
   * Blend Padding
   *
   * Applies padding to the blend image.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-padding)
   */
  blendPad?: InputMaybe<Scalars['IntType']>;
  /**
   * Blend Size
   *
   * Adjusts the size of the blend image.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-size)
   */
  blendSize?: InputMaybe<ImgixParamsBlendSize>;
  /**
   * Blend Width
   *
   * Adjusts the width of the blend image.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-width)
   */
  blendW?: InputMaybe<Scalars['FloatType']>;
  /**
   * Blend X Position
   *
   * Adjusts the x-offset of the blend image relative to its parent.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-x-position)
   */
  blendX?: InputMaybe<Scalars['IntType']>;
  /**
   * Blend Y Position
   *
   * Adjusts the y-offset of the blend image relative to its parent.
   *
   * Depends on: `blend`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/blending/blend-y-position)
   */
  blendY?: InputMaybe<Scalars['IntType']>;
  /**
   * Gaussian Blur
   *
   * Applies a gaussian blur to an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/stylize/gaussian-blur)
   */
  blur?: InputMaybe<Scalars['IntType']>;
  /**
   * Border Size & Color
   *
   * Applies a border to an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size)
   */
  border?: InputMaybe<Scalars['String']>;
  /**
   * Border Bottom
   *
   * Sets bottom border of an image.
   *
   * Depends on: `border`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/border-bottom)
   */
  borderBottom?: InputMaybe<Scalars['IntType']>;
  /**
   * Border Left
   *
   * Sets left border of an image.
   *
   * Depends on: `border`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/border-left)
   */
  borderLeft?: InputMaybe<Scalars['IntType']>;
  /**
   * Outer Border Radius
   *
   * Sets the outer radius of the image's border in pixels.
   *
   * Depends on: `border`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/outer-border-radius)
   */
  borderRadius?: InputMaybe<Scalars['String']>;
  /**
   * Inner Border Radius
   *
   * Sets the inner radius of the image's border in pixels.
   *
   * Depends on: `border`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/inner-border-radius)
   */
  borderRadiusInner?: InputMaybe<Scalars['String']>;
  /**
   * Border Right
   *
   * Sets right border of an image.
   *
   * Depends on: `border`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/border-right)
   */
  borderRight?: InputMaybe<Scalars['IntType']>;
  /**
   * Border Top
   *
   * Sets top border of an image.
   *
   * Depends on: `border`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/border-top)
   */
  borderTop?: InputMaybe<Scalars['IntType']>;
  /**
   * Brightness
   *
   * Adjusts the brightness of the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/brightness)
   */
  bri?: InputMaybe<Scalars['IntType']>;
  /**
   * Client Hints
   *
   * Sets one or more Client-Hints headers
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/client-hints)
   */
  ch?: InputMaybe<Array<ImgixParamsCh>>;
  /**
   * Chroma Subsampling
   *
   * Specifies the output chroma subsampling rate.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/chroma-subsampling)
   */
  chromasub?: InputMaybe<Scalars['IntType']>;
  /**
   * Color Quantization
   *
   * Limits the number of unique colors in an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/color-quantization)
   */
  colorquant?: InputMaybe<Scalars['IntType']>;
  /**
   * Palette Color Count
   *
   * Specifies how many colors to include in a palette-extraction response.
   *
   * Depends on: `palette`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/color-palette/palette-color-count)
   */
  colors?: InputMaybe<Scalars['IntType']>;
  /**
   * Contrast
   *
   * Adjusts the contrast of the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/contrast)
   */
  con?: InputMaybe<Scalars['IntType']>;
  /**
   * Mask Corner Radius
   *
   * Specifies the radius value for a rounded corner mask.
   *
   * Depends on: `mask=corners`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/mask-image/mask-corner-radius)
   */
  cornerRadius?: InputMaybe<Scalars['String']>;
  /**
   * Crop Mode
   *
   * Specifies how to crop an image.
   *
   * Depends on: `fit=crop`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/crop-mode)
   */
  crop?: InputMaybe<Array<ImgixParamsCrop>>;
  /**
   * Color Space
   *
   * Specifies the color space of the output image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/color-space)
   */
  cs?: InputMaybe<ImgixParamsCs>;
  /**
   * Download
   *
   * Forces a URL to use send-file in its response.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/download)
   */
  dl?: InputMaybe<Scalars['String']>;
  /**
   * Dots Per Inch
   *
   * Sets the DPI value in the EXIF header.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/dots-per-inch)
   */
  dpi?: InputMaybe<Scalars['IntType']>;
  /**
   * Device Pixel Ratio
   *
   * Adjusts the device-pixel ratio of the output image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/device-pixel-ratio)
   */
  dpr?: InputMaybe<Scalars['FloatType']>;
  /**
   * Duotone
   *
   * Applies a duotone effect to the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/stylize/duotone)
   */
  duotone?: InputMaybe<Scalars['String']>;
  /**
   * Duotone Alpha
   *
   * Changes the alpha of the duotone effect atop the source image.
   *
   * Depends on: `duotone`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/stylize/duotone-alpha)
   */
  duotoneAlpha?: InputMaybe<Scalars['IntType']>;
  /**
   * Exposure
   *
   * Adjusts the exposure of the output image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/exposure)
   */
  exp?: InputMaybe<Scalars['IntType']>;
  /**
   * Url Expiration Timestamp
   *
   * A Unix timestamp specifying a UTC time. Requests made to this URL after that time will output a 404 status code.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/expiration)
   */
  expires?: InputMaybe<Scalars['IntType']>;
  /**
   * Face Blur
   *
   * Specifies the amount of blur to apply to detected faces. Defaults to 0.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/face-detection/face-blur)
   */
  faceBlur?: InputMaybe<Scalars['IntType']>;
  /**
   * Face Pixelation
   *
   * Specifies the pixelation amount of the face.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/face-detection/face-pixelation)
   */
  facePixel?: InputMaybe<Scalars['IntType']>;
  /**
   * Face Index
   *
   * Selects a face to crop to.
   *
   * Depends on: `fit=facearea`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/face-detection/face-index)
   */
  faceindex?: InputMaybe<Scalars['IntType']>;
  /**
   * Face Padding
   *
   * Adjusts padding around a selected face.
   *
   * Depends on: `fit=facearea`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/face-detection/face-padding)
   */
  facepad?: InputMaybe<Scalars['FloatType']>;
  /**
   * Json Face Data
   *
   * Specifies that face data should be included in output when combined with `fm=json`.
   *
   * Depends on: `fm=json`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/face-detection/json-face-data)
   */
  faces?: InputMaybe<Scalars['IntType']>;
  /**
   * Fill Mode
   *
   * Determines how to fill in additional space created by the fit setting
   *
   * Depends on: `fit`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-mode)
   */
  fill?: InputMaybe<ImgixParamsFill>;
  /**
   * Fill Color
   *
   * Sets the fill color for images with additional space created by the fit setting
   *
   * Depends on: `fill=solid`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-color)
   */
  fillColor?: InputMaybe<Scalars['String']>;
  /**
   * Fill Generative Fallback
   *
   * Sets the fallback behavior for generative fill.
   *
   * Depends on: `fit=fill`, `fill=gen`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-generative-fallback)
   */
  fillGenFallback?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Fill Generative Negative Prompt
   *
   * Provides a negative text suggestion to the generative fill parameter. Used to reduce the probability of a subject, detail, or object appearing in generative output.
   *
   * Depends on: `fit=fill`, `fill=gen`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-generative-negative-prompt)
   */
  fillGenNegPrompt?: InputMaybe<Scalars['String']>;
  /**
   * Fill Generative Position
   *
   * Sets the position of the Origin Image in relation to the generative fill.
   *
   * Depends on: `fit=fill`, `fill=gen`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-generative-position)
   */
  fillGenPos?: InputMaybe<Array<ImgixParamsFillGenPos>>;
  /**
   * Fill Generative Prompt
   *
   * Provides a text suggestion to the generative fill parameter.
   *
   * Depends on: `fit=fill`, `fill=gen`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-generative-prompt)
   */
  fillGenPrompt?: InputMaybe<Scalars['String']>;
  /**
   * Fill Generative Seed
   *
   * Sets the generative seed value. Used to generate similar outputs from different prompts.
   *
   * Depends on: `fit=fill`, `fill=gen`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-generative-seed)
   */
  fillGenSeed?: InputMaybe<Scalars['IntType']>;
  /**
   * Fill Gradient Color Space
   *
   * Defines the color space as linear, sRGB, Oklab, HSL, or LCH for gradient color interpolation
   *
   * Depends on: `fit=fill`, `fill=gradient`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-color-space)
   */
  fillGradientCs?: InputMaybe<ImgixParamsFillGradientCs>;
  /**
   * Fill Gradient Linear
   *
   * Blends a gradient between two colors, {color1} and {color2}, along a straight path
   *
   * Depends on: `fit=fill`, `fill=gradient`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-linear)
   */
  fillGradientLinear?: InputMaybe<Scalars['String']>;
  /**
   * Fill Gradient Linear Direction
   *
   * The fill-gradient-linear-direction specifies the gradient's direction, flowing towards the bottom, top, right, or left
   *
   * Depends on: `fit=fill`, `fill=gen`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-linear-direction)
   */
  fillGradientLinearDirection?: InputMaybe<Array<ImgixParamsFillGradientLinearDirection>>;
  /**
   * Fill Gradient Radial
   *
   * The fill-gradient-radial parameter creates a circular gradient transitioning from a central color (Color1) to an outer color (Color2)
   *
   * Depends on: `fit=fill`, `fill=gradient`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-radial)
   */
  fillGradientRadial?: InputMaybe<Scalars['String']>;
  /**
   * Fill Gradient Radial Radius
   *
   * Parameter defines the radial gradient's radius as pixels or a percentage (0.0-1.0) of the image's smallest dimension
   *
   * Depends on: `fit=fill`, `fill=gradient`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-radial-radius)
   */
  fillGradientRadialRadius?: InputMaybe<Scalars['String']>;
  /**
   * Fill Gradient Radial X
   *
   * Specifies the location of the radial gradient's center along the x-axis, using either a pixel value or a floating point percentage (ranging from 0.0 to 1.0) of the image's width
   *
   * Depends on: `fit=fill`, `fill=gradient`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-radial-x)
   */
  fillGradientRadialX?: InputMaybe<Scalars['FloatType']>;
  /**
   * Fill Gradient Radial Y
   *
   * Parameter sets the radial gradient's center on the y-axis, using pixels or a 0.0 to 1.0 percentage of the image's height
   *
   * Depends on: `fit=fill`, `fill=gradient`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-radial-y)
   */
  fillGradientRadialY?: InputMaybe<Scalars['FloatType']>;
  /**
   * Fill Gradient Type
   *
   * Specifies if a gradient is radial (circular) or linear (straight)
   *
   * Depends on: `fit=fill`, `fill=gradient`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/fill-gradient-type)
   */
  fillGradientType?: InputMaybe<ImgixParamsFillGradientType>;
  /**
   * Resize Fit Mode
   *
   * Specifies how to map the source image to the output image dimensions.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/resize-fit-mode)
   */
  fit?: InputMaybe<ImgixParamsFit>;
  /**
   * Flip Axis
   *
   * Flips an image on a specified axis.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/rotation/flip-axis)
   */
  flip?: InputMaybe<ImgixParamsFlip>;
  /**
   * Output Format
   *
   * Changes the format of the output image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/output-format)
   */
  fm?: InputMaybe<ImgixParamsFm>;
  /**
   * Focal Point Debug
   *
   * Displays crosshairs identifying the location of the set focal point
   *
   * Depends on: `fit=crop`, `crop=focalpoint`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/focal-point-crop/focal-point-debug)
   */
  fpDebug?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Focal Point X Position
   *
   * Sets the relative horizontal value for the focal point of an image
   *
   * Depends on: `fit=crop`, `crop=focalpoint`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/focal-point-crop/focal-point-x-position)
   */
  fpX?: InputMaybe<Scalars['FloatType']>;
  /**
   * Focal Point Y Position
   *
   * Sets the relative vertical value for the focal point of an image
   *
   * Depends on: `fit=crop`, `crop=focalpoint`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/focal-point-crop/focal-point-y-position)
   */
  fpY?: InputMaybe<Scalars['FloatType']>;
  /**
   * Focal Point Zoom
   *
   * Sets the relative zoom value for the focal point of an image
   *
   * Depends on: `fit=crop`, `crop=focalpoint`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/focal-point-crop/focal-point-zoom)
   */
  fpZ?: InputMaybe<Scalars['FloatType']>;
  /**
   * Frames Per Second
   *
   * Specifies the framerate of the generated image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/animation/frames-per-second)
   */
  fps?: InputMaybe<Scalars['IntType']>;
  /**
   * Frame Selection
   *
   * Specifies the frame of an animated image to use.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/animation/frame-selection)
   */
  frame?: InputMaybe<Scalars['String']>;
  /**
   * Gamma
   *
   * Adjusts the gamma of the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/gamma)
   */
  gam?: InputMaybe<Scalars['IntType']>;
  /**
   * Animated Gif Quality
   *
   * Specifies the quality of the animated gif. The higher the value, the better more compression is applied.
   *
   * Depends on: `fm=gif`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/animation/animated-gif-quality)
   */
  gifQ?: InputMaybe<Scalars['IntType']>;
  /**
   * Grid Colors
   *
   * Sets grid colors for the transparency checkerboard grid.
   *
   * Depends on: `transparency`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/grid-colors)
   */
  gridColors?: InputMaybe<Scalars['String']>;
  /**
   * Grid Size
   *
   * Sets grid size for the transparency checkerboard grid.
   *
   * Depends on: `transparency`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/grid-size)
   */
  gridSize?: InputMaybe<Scalars['IntType']>;
  /**
   * Image Height
   *
   * Adjusts the height of the output image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/image-height)
   */
  h?: InputMaybe<Scalars['FloatType']>;
  /**
   * Highlight
   *
   * Adjusts the highlights of the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/highlight)
   */
  high?: InputMaybe<Scalars['IntType']>;
  /**
   * Halftone
   *
   * Applies a half-tone effect to the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/stylize/halftone)
   */
  htn?: InputMaybe<Scalars['IntType']>;
  /**
   * Hue Shift
   *
   * Adjusts the hue of the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/hue-shift)
   */
  hue?: InputMaybe<Scalars['IntType']>;
  /**
   * Frame Interval
   *
   * Displays every Nth frame starting with the first frame.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/animation/frame-interval)
   */
  interval?: InputMaybe<Scalars['IntType']>;
  /**
   * Invert
   *
   * Inverts the colors on the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/invert)
   */
  invert?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Iptc Passthrough
   *
   * Determine if IPTC data should be passed for JPEG images.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/iptc-passthrough)
   */
  iptc?: InputMaybe<ImgixParamsIptc>;
  /**
   * Jpg Progressive
   *
   * Specifies whether or not a jpg/jpeg uses progressive (true) or baseline (false)
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/jpg-progressive)
   */
  jpgProgressive?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Animation Loop Count
   *
   * Specifies the number of times an animated image should repeat. A value of 0 means infinite looping.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/animation)
   */
  loop?: InputMaybe<Scalars['IntType']>;
  /**
   * Lossless Compression
   *
   * Specifies that the output image should be a lossless variant.
   *
   * Depends on: `fm=webp`, `fm=jxr`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/lossless-compression)
   */
  lossless?: InputMaybe<Scalars['BooleanType']>;
  /**
   * License Plate Blur
   *
   * Specifies the amount of blur to apply to detected license plates. Defaults to 0.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/license-plate-detection/license-plate-blur)
   */
  lpBlur?: InputMaybe<Scalars['IntType']>;
  /**
   * Watermark Image Url
   *
   * Specifies the location of the watermark image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-image-url)
   */
  mark?: InputMaybe<Scalars['String']>;
  /**
   * Watermark Alignment Mode
   *
   * Changes the watermark alignment relative to the parent image.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-alignment-mode)
   */
  markAlign?: InputMaybe<Array<ImgixParamsMarkAlign>>;
  /**
   * Watermark Alpha
   *
   * Changes the alpha of the watermark image.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-alpha)
   */
  markAlpha?: InputMaybe<Scalars['IntType']>;
  /**
   * Watermark Base Url
   *
   * Changes base URL of the watermark image.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-base-url)
   */
  markBase?: InputMaybe<Scalars['String']>;
  /**
   * Watermark Fit Mode
   *
   * Specifies the fit mode for watermark images.
   *
   * Depends on: `mark`, `markw`, `markh`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-fit-mode)
   */
  markFit?: InputMaybe<ImgixParamsMarkFit>;
  /**
   * Watermark Height
   *
   * Adjusts the height of the watermark image.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-height)
   */
  markH?: InputMaybe<Scalars['FloatType']>;
  /**
   * Watermark If Minimum Height
   *
   * Displays the watermark if rendered base image pixel height is equal to or larger than the supplied value
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-if-minimum-height)
   */
  markIfMinHeight?: InputMaybe<Scalars['IntType']>;
  /**
   * Watermark If Minimum Width
   *
   * Displays the watermark if rendered base image pixel width is equal to or larger than the supplied value
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-if-minimum-width)
   */
  markIfMinWidth?: InputMaybe<Scalars['IntType']>;
  /**
   * Watermark Padding
   *
   * Applies padding to the watermark image.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-padding)
   */
  markPad?: InputMaybe<Scalars['IntType']>;
  /**
   * Watermark Rotation
   *
   * Rotates a watermark or tiled watermarks by a specified number of degrees.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-rotation)
   */
  markRot?: InputMaybe<Scalars['FloatType']>;
  /**
   * Watermark Scale
   *
   * Adjusts the scale of the watermark image.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-scale)
   */
  markScale?: InputMaybe<Scalars['IntType']>;
  /**
   * Watermark Tile
   *
   * Adds tiled watermark.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-tile)
   */
  markTile?: InputMaybe<ImgixParamsMarkTile>;
  /**
   * Watermark Width
   *
   * Adjusts the width of the watermark image.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-width)
   */
  markW?: InputMaybe<Scalars['FloatType']>;
  /**
   * Watermark X Position
   *
   * Adjusts the x-offset of the watermark image relative to its parent.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-x-position)
   */
  markX?: InputMaybe<Scalars['IntType']>;
  /**
   * Watermark Y Position
   *
   * Adjusts the y-offset of the watermark image relative to its parent.
   *
   * Depends on: `mark`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/watermark/watermark-y-position)
   */
  markY?: InputMaybe<Scalars['IntType']>;
  /**
   * Mask Type
   *
   * Defines the type of mask and specifies the URL if that type is selected.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/mask-image/mask-type)
   */
  mask?: InputMaybe<Scalars['String']>;
  /**
   * Mask Background Color
   *
   * Colors the background of the transparent mask area of images
   *
   * Depends on: `mask`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/mask-image/mask-background-color)
   */
  maskBg?: InputMaybe<Scalars['String']>;
  /**
   * Maximum Height
   *
   * Specifies the maximum height of the output image in pixels.
   *
   * Depends on: `fit=crop`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/maximum-height)
   */
  maxH?: InputMaybe<Scalars['IntType']>;
  /**
   * Maximum Width
   *
   * Specifies the maximum width of the output image in pixels.
   *
   * Depends on: `fit=crop`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/maximum-width)
   */
  maxW?: InputMaybe<Scalars['IntType']>;
  /**
   * Minimum Height
   *
   * Specifies the minimum height of the output image in pixels.
   *
   * Depends on: `fit=crop`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/minimum-height)
   */
  minH?: InputMaybe<Scalars['IntType']>;
  /**
   * Minimum Width
   *
   * Specifies the minimum width of the output image in pixels.
   *
   * Depends on: `fit=crop`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/minimum-width)
   */
  minW?: InputMaybe<Scalars['IntType']>;
  /**
   * Monochrome
   *
   * Applies a monochrome effect to the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/stylize/monochrome)
   */
  monochrome?: InputMaybe<Scalars['String']>;
  /**
   * Noise Reduction Bound
   *
   * Reduces the noise in an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/noise-reduction/noise-reduction-bound)
   */
  nr?: InputMaybe<Scalars['IntType']>;
  /**
   * Noise Reduction Sharpen
   *
   * Provides a threshold by which to sharpen an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/noise-reduction/noise-reduction-sharpen)
   */
  nrs?: InputMaybe<Scalars['IntType']>;
  /**
   * Object Removal Negative Prompt
   *
   * Provides a negative text suggestion to object-removal-prompt. Used to reduce the probability of a subject, detail, or object appearing in generative output.
   *
   * Depends on: `object-removal-rect`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/object-manipulation/object-removal-negative-prompt)
   */
  objectRemovalNegativePrompt?: InputMaybe<Scalars['String']>;
  /**
   * Object Removal Prompt
   *
   * Suggest auto generative fill for the object-removal-rect parameter
   *
   * Depends on: `object-removal-rect`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/object-manipulation/object-removal-prompt)
   */
  objectRemovalPrompt?: InputMaybe<Scalars['String']>;
  /**
   * Object Removal
   *
   * Using a specified rectangle, an object is removed from the image
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/object-manipulation/object-removal)
   */
  objectRemovalRect?: InputMaybe<Scalars['String']>;
  /**
   * Object Removal Seed
   *
   * Sets the generative seed value for object-removal. Used to generate new outputs from the same prompt
   *
   * Depends on: `object-removal-rect`, `object-removal-prompt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/object-manipulation/object-removal-seed)
   */
  objectRemovalSeed?: InputMaybe<Scalars['IntType']>;
  /**
   * Orientation
   *
   * Changes the image orientation.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/rotation/orientation)
   */
  orient?: InputMaybe<Scalars['IntType']>;
  /**
   * Padding
   *
   * Pads an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/padding)
   */
  pad?: InputMaybe<Scalars['IntType']>;
  /**
   * Padding Bottom
   *
   * Sets bottom padding of an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/padding-bottom)
   */
  padBottom?: InputMaybe<Scalars['IntType']>;
  /**
   * Padding Left
   *
   * Sets left padding of an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/padding-left)
   */
  padLeft?: InputMaybe<Scalars['IntType']>;
  /**
   * Padding Right
   *
   * Sets right padding of an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/padding-right)
   */
  padRight?: InputMaybe<Scalars['IntType']>;
  /**
   * Padding Top
   *
   * Sets top padding of an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/border-and-padding/padding-top)
   */
  padTop?: InputMaybe<Scalars['IntType']>;
  /**
   * Pdf Page Number
   *
   * Selects a page from a PDF for display.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/pdf/pdf-page-number)
   */
  page?: InputMaybe<Scalars['IntType']>;
  /**
   * Color Palette Extraction
   *
   * Specifies an output format for palette-extraction.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/color-palette/color-palette-extraction)
   */
  palette?: InputMaybe<ImgixParamsPalette>;
  /**
   * Pdf Annotation
   *
   * Enables or disables PDF annotation.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/pdf/pdf-annotation)
   */
  pdfAnnotation?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Css Prefix
   *
   * Specifies a CSS prefix for all classes in palette-extraction.
   *
   * Depends on: `palette=css`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/color-palette/css-prefix)
   */
  prefix?: InputMaybe<Scalars['String']>;
  /**
   * Pixellate
   *
   * Applies a pixelation effect to an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/stylize/pixellate)
   */
  px?: InputMaybe<Scalars['IntType']>;
  /**
   * Output Quality
   *
   * Adjusts the quality of an output image.
   *
   * Depends on: `fm=avif`, `fm=jpg`, `fm=pjpg`, `fm=webp`, `fm=jxr`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/output-quality)
   */
  q?: InputMaybe<Scalars['IntType']>;
  /**
   * Rasterize Bypass
   *
   * Bypasses all rendering parameters (including default parameters) and serves the original image. Works for svg+xml,x-eps,pdf, and vnd.adobe.illustrator.
   */
  rasterizeBypass?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Source Rectangle Region
   *
   * Crops an image to a specified rectangle.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/source-rectangle-region)
   */
  rect?: InputMaybe<Scalars['String']>;
  /**
   * Reverse
   *
   * Reverses the frame order on the source animation.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/animation/reverse)
   */
  reverse?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Rotation
   *
   * Rotates an image by a specified number of degrees.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/rotation/rotation)
   */
  rot?: InputMaybe<Scalars['FloatType']>;
  /**
   * Rotation Type
   *
   * Changes the rotation type.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/rotation/rotation-type)
   */
  rotType?: InputMaybe<ImgixParamsRotType>;
  /**
   * Saturation
   *
   * Adjusts the saturation of an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/saturation)
   */
  sat?: InputMaybe<Scalars['IntType']>;
  /**
   * Sepia Tone
   *
   * Applies a sepia effect to an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/stylize/sepia-tone)
   */
  sepia?: InputMaybe<Scalars['IntType']>;
  /**
   * Shadow
   *
   * Adjusts the highlights of the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/shadow)
   */
  shad?: InputMaybe<Scalars['FloatType']>;
  /**
   * Sharpen
   *
   * Adjusts the sharpness of the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/sharpen)
   */
  sharp?: InputMaybe<Scalars['FloatType']>;
  /**
   * Frame Skip
   *
   * Skips every Nth frame starting with the first frame.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/animation/frame-skip)
   */
  skip?: InputMaybe<Scalars['IntType']>;
  /**
   * Bypasses any [DatoCMS Automatic Image Optimization](https://www.datocms.com/docs/cdn-settings/advanced-asset-settings) that might be set up for the project.
   *
   * Exercise caution when using this parameter, as it could significantly increase your bandwidth costs.
   */
  skipDefaultOptimizations?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Sanitize Svg
   *
   * Specifies whether to sanitize an SVG.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/format/sanitize-svg)
   */
  svgSanitize?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Transparency
   *
   * Adds checkerboard behind images which support transparency.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/fill/transparency)
   */
  transparency?: InputMaybe<ImgixParamsTransparency>;
  /**
   * Trim Image
   *
   * Trims the source image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/trim/trim-image)
   */
  trim?: InputMaybe<ImgixParamsTrim>;
  /**
   * Trim Alpha
   *
   * Specifies a trim alpha on a trim operation.
   *
   * Depends on: `trim=alpha`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/trim/trim-alpha)
   */
  trimAlpha?: InputMaybe<Scalars['FloatType']>;
  /**
   * Trim Color
   *
   * Specifies a trim color on a trim operation.
   *
   * Depends on: `trim=color`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/trim/trim-color)
   */
  trimColor?: InputMaybe<Scalars['String']>;
  /**
   * Trim Mean Difference
   *
   * Specifies the mean difference on a trim operation.
   *
   * Depends on: `trim=auto`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/trim/trim-mean-difference)
   */
  trimMd?: InputMaybe<Scalars['FloatType']>;
  /**
   * Trim Padding
   *
   * Pads the area of the source image before trimming.
   *
   * Depends on: `trim`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/trim/trim-padding)
   */
  trimPad?: InputMaybe<Scalars['IntType']>;
  /**
   * Trim Standard Deviation
   *
   * Specifies the standard deviation on a trim operation.
   *
   * Depends on: `trim=auto`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/trim/trim-standard-deviation)
   */
  trimSd?: InputMaybe<Scalars['FloatType']>;
  /**
   * Trim Tolerance
   *
   * Specifies the tolerance on a trim operation.
   *
   * Depends on: `trim=color`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/trim/trim-tolerance)
   */
  trimTol?: InputMaybe<Scalars['FloatType']>;
  /**
   * Text String
   *
   * Sets the text string to render.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-string)
   */
  txt?: InputMaybe<Scalars['String']>;
  /**
   * Text Align
   *
   * Sets the vertical and horizontal alignment of rendered text relative to the base image.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-align)
   */
  txtAlign?: InputMaybe<Array<ImgixParamsTxtAlign>>;
  /**
   * Text Clipping Mode
   *
   * Sets the clipping properties of rendered text.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-clipping-mode)
   */
  txtClip?: InputMaybe<Array<ImgixParamsTxtClip>>;
  /**
   * Text Color
   *
   * Specifies the color of rendered text.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-color)
   */
  txtColor?: InputMaybe<Scalars['String']>;
  /**
   * Text Fit Mode
   *
   * Specifies the fit approach for rendered text.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-fit-mode)
   */
  txtFit?: InputMaybe<ImgixParamsTxtFit>;
  /**
   * Text Font
   *
   * Selects a font for rendered text.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-font)
   */
  txtFont?: InputMaybe<Scalars['String']>;
  /**
   * Text Leading
   *
   * Sets the leading (line spacing) for rendered text. Only works on the multi-line text endpoint.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/typesetting-endpoint/text-leading)
   */
  txtLead?: InputMaybe<Scalars['IntType']>;
  /**
   * Text Outline
   *
   * Outlines the rendered text with a specified color.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-outline)
   */
  txtLine?: InputMaybe<Scalars['IntType']>;
  /**
   * Text Outline Color
   *
   * Specifies a text outline color.
   *
   * Depends on: `txt`, `txtline`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-outline-color)
   */
  txtLineColor?: InputMaybe<Scalars['String']>;
  /**
   * Text Padding
   *
   * Specifies the padding (in device-independent pixels) between a textbox and the edges of the base image.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-padding)
   */
  txtPad?: InputMaybe<Scalars['IntType']>;
  /**
   * Text Shadow
   *
   * Applies a shadow to rendered text.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-shadow)
   */
  txtShad?: InputMaybe<Scalars['FloatType']>;
  /**
   * Text Font Size
   *
   * Sets the font size of rendered text.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-font-size)
   */
  txtSize?: InputMaybe<Scalars['IntType']>;
  /**
   * Text Tracking
   *
   * Sets the tracking (letter spacing) for rendered text. Only works on the multi-line text endpoint.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/typesetting-endpoint/text-tracking)
   */
  txtTrack?: InputMaybe<Scalars['IntType']>;
  /**
   * Text Width
   *
   * Sets the width of rendered text.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-width)
   */
  txtWidth?: InputMaybe<Scalars['IntType']>;
  /**
   * Text X Position
   *
   * Sets the horizontal (x) position of the text in pixels relative to the left edge of the base image.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-x-position)
   */
  txtX?: InputMaybe<Scalars['IntType']>;
  /**
   * Text Y Position
   *
   * Sets the vertical (y) position of the text in pixels relative to the top edge of the base image.
   *
   * Depends on: `txt`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/text/text-y-position)
   */
  txtY?: InputMaybe<Scalars['IntType']>;
  /**
   * Super Resolution
   *
   * Uses generative AI fill to upscale low resolution images.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/super-resolution)
   */
  upscale?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Super Resolution Fallback
   *
   * Overrides default fallback behavior for super resolution failures
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/super-resolution)
   */
  upscaleFallback?: InputMaybe<Scalars['BooleanType']>;
  /**
   * Unsharp Mask
   *
   * Sharpens the source image using an unsharp mask.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/unsharp-mask)
   */
  usm?: InputMaybe<Scalars['IntType']>;
  /**
   * Unsharp Mask Radius
   *
   * Specifies the radius for an unsharp mask operation.
   *
   * Depends on: `usm`
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/unsharp-mask-radius)
   */
  usmrad?: InputMaybe<Scalars['FloatType']>;
  /**
   * Vibrance
   *
   * Adjusts the vibrance of an image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/adjustment/vibrance)
   */
  vib?: InputMaybe<Scalars['IntType']>;
  /**
   * Image Width
   *
   * Adjusts the width of the output image.
   *
   * [Open Imgix reference »](https://docs.imgix.com/apis/rendering/size/image-width)
   */
  w?: InputMaybe<Scalars['FloatType']>;
};

enum ImgixParamsAuto {
  compress = 'compress',
  enhance = 'enhance',
  format = 'format',
  redeye = 'redeye'
}

enum ImgixParamsBgRemoveFgType {
  auto = 'auto',
  car = 'car'
}

enum ImgixParamsBlendAlign {
  bottom = 'bottom',
  center = 'center',
  left = 'left',
  middle = 'middle',
  right = 'right',
  top = 'top'
}

enum ImgixParamsBlendCrop {
  bottom = 'bottom',
  faces = 'faces',
  left = 'left',
  right = 'right',
  top = 'top'
}

enum ImgixParamsBlendFit {
  clamp = 'clamp',
  clip = 'clip',
  crop = 'crop',
  max = 'max',
  scale = 'scale'
}

enum ImgixParamsBlendMode {
  burn = 'burn',
  color = 'color',
  darken = 'darken',
  difference = 'difference',
  dodge = 'dodge',
  exclusion = 'exclusion',
  hardlight = 'hardlight',
  hue = 'hue',
  lighten = 'lighten',
  luminosity = 'luminosity',
  multiply = 'multiply',
  normal = 'normal',
  overlay = 'overlay',
  saturation = 'saturation',
  screen = 'screen',
  softlight = 'softlight'
}

enum ImgixParamsBlendSize {
  inherit = 'inherit'
}

enum ImgixParamsCh {
  dpr = 'dpr',
  saveData = 'saveData',
  width = 'width'
}

enum ImgixParamsCrop {
  bottom = 'bottom',
  edges = 'edges',
  entropy = 'entropy',
  faces = 'faces',
  focalpoint = 'focalpoint',
  left = 'left',
  right = 'right',
  top = 'top'
}

enum ImgixParamsCs {
  adobergb1998 = 'adobergb1998',
  origin = 'origin',
  srgb = 'srgb',
  strip = 'strip',
  tinysrgb = 'tinysrgb'
}

enum ImgixParamsFill {
  blur = 'blur',
  gen = 'gen',
  generative = 'generative',
  gradient = 'gradient',
  solid = 'solid'
}

enum ImgixParamsFillGenPos {
  bottom = 'bottom',
  center = 'center',
  left = 'left',
  middle = 'middle',
  right = 'right',
  top = 'top'
}

enum ImgixParamsFillGradientCs {
  hsl = 'hsl',
  lch = 'lch',
  linear = 'linear',
  oklab = 'oklab',
  srgb = 'srgb'
}

enum ImgixParamsFillGradientLinearDirection {
  bottom = 'bottom',
  left = 'left',
  right = 'right',
  top = 'top'
}

enum ImgixParamsFillGradientType {
  linear = 'linear',
  radial = 'radial'
}

enum ImgixParamsFit {
  clamp = 'clamp',
  clip = 'clip',
  crop = 'crop',
  facearea = 'facearea',
  fill = 'fill',
  fillmax = 'fillmax',
  max = 'max',
  min = 'min',
  scale = 'scale'
}

enum ImgixParamsFlip {
  h = 'h',
  hv = 'hv',
  v = 'v'
}

enum ImgixParamsFm {
  avif = 'avif',
  blurhash = 'blurhash',
  gif = 'gif',
  jp2 = 'jp2',
  jpg = 'jpg',
  json = 'json',
  jxr = 'jxr',
  mp4 = 'mp4',
  pjpg = 'pjpg',
  png = 'png',
  png8 = 'png8',
  png32 = 'png32',
  webm = 'webm',
  webp = 'webp'
}

enum ImgixParamsIptc {
  allow = 'allow',
  block = 'block'
}

enum ImgixParamsMarkAlign {
  bottom = 'bottom',
  center = 'center',
  left = 'left',
  middle = 'middle',
  right = 'right',
  top = 'top'
}

enum ImgixParamsMarkFit {
  clip = 'clip',
  crop = 'crop',
  fill = 'fill',
  max = 'max',
  scale = 'scale'
}

enum ImgixParamsMarkTile {
  grid = 'grid'
}

enum ImgixParamsPalette {
  css = 'css',
  json = 'json'
}

enum ImgixParamsRotType {
  pivot = 'pivot',
  straighten = 'straighten'
}

enum ImgixParamsTransparency {
  grid = 'grid'
}

enum ImgixParamsTrim {
  alpha = 'alpha',
  auto = 'auto',
  color = 'color'
}

enum ImgixParamsTxtAlign {
  bottom = 'bottom',
  center = 'center',
  left = 'left',
  middle = 'middle',
  right = 'right',
  top = 'top'
}

enum ImgixParamsTxtClip {
  ellipsis = 'ellipsis',
  end = 'end',
  middle = 'middle',
  start = 'start'
}

enum ImgixParamsTxtFit {
  max = 'max'
}

type InEnglishModelContentBlocksField = ButtonRecord | ImageRecord | TextRecord | VideoRecord;

type InEnglishModelContentField = {
  __typename?: 'InEnglishModelContentField';
  blocks: Array<InEnglishModelContentBlocksField>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

/** Record of type In english (in_english) */
type InEnglishRecord = RecordInterface & {
  __typename?: 'InEnglishRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  content: InEnglishModelContentField;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type In english (in_english) */
type InEnglishRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter by usage */
type InUseFilter = {
  /** Search uploads that are currently used by some record or not */
  eq?: InputMaybe<Scalars['BooleanType']>;
};

/** Specifies how to filter Integer fields */
type IntegerFilter = {
  /** Search for records with an exact match */
  eq?: InputMaybe<Scalars['IntType']>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with a value that's strictly greater than the one specified */
  gt?: InputMaybe<Scalars['IntType']>;
  /** Filter records with a value that's greater than or equal to the one specified */
  gte?: InputMaybe<Scalars['IntType']>;
  /** Filter records with a value that's less than the one specified */
  lt?: InputMaybe<Scalars['IntType']>;
  /** Filter records with a value that's less or equal than the one specified */
  lte?: InputMaybe<Scalars['IntType']>;
  /** Exclude records with an exact match */
  neq?: InputMaybe<Scalars['IntType']>;
};

/** Record of type Våra initiativ (intro_initiative) */
type IntroInitiativeRecord = RecordInterface & {
  __typename?: 'IntroInitiativeRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  intro: Scalars['String'];
  slug?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Våra initiativ (intro_initiative) */
type IntroInitiativeRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Våra initiativ (intro_initiative) */
type IntroInitiativeRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Specifies how to filter by ID */
type ItemIdFilter = {
  /** Search the record with the specified ID */
  eq?: InputMaybe<Scalars['ItemId']>;
  /** Search records with the specified IDs */
  in?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
  /** Exclude the record with the specified ID */
  neq?: InputMaybe<Scalars['ItemId']>;
  /** Search records that do not have the specified IDs */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
};

enum ItemStatus {
  draft = 'draft',
  published = 'published',
  updated = 'updated'
}

/** Block of type Senaste nytt för medlemmar (latest_member_news) */
type LatestMemberNewsRecord = RecordInterface & {
  __typename?: 'LatestMemberNewsRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ItemId'];
  updatedAt: Scalars['DateTime'];
};


/** Block of type Senaste nytt för medlemmar (latest_member_news) */
type LatestMemberNewsRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Block of type Senaste nyheterna (latest_news) */
type LatestNewsRecord = RecordInterface & {
  __typename?: 'LatestNewsRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ItemId'];
  updatedAt: Scalars['DateTime'];
};


/** Block of type Senaste nyheterna (latest_news) */
type LatestNewsRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter Single-link fields */
type LinkFilter = {
  /** Search for records with an exact match. The specified value must be a Record ID */
  eq?: InputMaybe<Scalars['ItemId']>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records linked to one of the specified records */
  in?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
  /** Exclude records with an exact match. The specified value must be a Record ID */
  neq?: InputMaybe<Scalars['ItemId']>;
  /** Filter records not linked to one of the specified records */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
};

/** Specifies how to filter Multiple-links fields */
type LinksFilter = {
  /** Filter records linked to all of the specified records. The specified values must be Record IDs */
  allIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
  /** Filter records linked to at least one of the specified records. The specified values must be Record IDs */
  anyIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
  /** Search for records with an exact match. The specified values must be Record IDs */
  eq?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records not linked to any of the specified records. The specified values must be Record IDs */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>>>;
};

type MemberCategoryModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<MemberCategoryModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<MemberCategoryModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  categoryType?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum MemberCategoryModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  categoryType_ASC = 'categoryType_ASC',
  categoryType_DESC = 'categoryType_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Typ av konst (member_category) */
type MemberCategoryRecord = RecordInterface & {
  __typename?: 'MemberCategoryRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  categoryType: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Typ av konst (member_category) */
type MemberCategoryRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type MemberModelContentField = ImageRecord | VideoRecord;

type MemberModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<MemberModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<MemberModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  active?: InputMaybe<BooleanFilter>;
  application?: InputMaybe<LinkFilter>;
  bio?: InputMaybe<TextFilter>;
  birthPlace?: InputMaybe<StringFilter>;
  city?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  email?: InputMaybe<StringFilter>;
  firstName?: InputMaybe<StringFilter>;
  fullName?: InputMaybe<StringFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  instagram?: InputMaybe<StringFilter>;
  lastName?: InputMaybe<StringFilter>;
  memberCategory?: InputMaybe<LinksFilter>;
  password?: InputMaybe<StringFilter>;
  region?: InputMaybe<LinkFilter>;
  resettoken?: InputMaybe<StringFilter>;
  showContact?: InputMaybe<BooleanFilter>;
  slug?: InputMaybe<SlugFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
  webpage?: InputMaybe<StringFilter>;
  yearOfBirth?: InputMaybe<StringFilter>;
};

enum MemberModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  active_ASC = 'active_ASC',
  active_DESC = 'active_DESC',
  birthPlace_ASC = 'birthPlace_ASC',
  birthPlace_DESC = 'birthPlace_DESC',
  city_ASC = 'city_ASC',
  city_DESC = 'city_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  email_ASC = 'email_ASC',
  email_DESC = 'email_DESC',
  firstName_ASC = 'firstName_ASC',
  firstName_DESC = 'firstName_DESC',
  fullName_ASC = 'fullName_ASC',
  fullName_DESC = 'fullName_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  instagram_ASC = 'instagram_ASC',
  instagram_DESC = 'instagram_DESC',
  lastName_ASC = 'lastName_ASC',
  lastName_DESC = 'lastName_DESC',
  password_ASC = 'password_ASC',
  password_DESC = 'password_DESC',
  resettoken_ASC = 'resettoken_ASC',
  resettoken_DESC = 'resettoken_DESC',
  showContact_ASC = 'showContact_ASC',
  showContact_DESC = 'showContact_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
  webpage_ASC = 'webpage_ASC',
  webpage_DESC = 'webpage_DESC',
  yearOfBirth_ASC = 'yearOfBirth_ASC',
  yearOfBirth_DESC = 'yearOfBirth_DESC'
}

type MemberNewsCategoryModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<MemberNewsCategoryModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<MemberNewsCategoryModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  category?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  position?: InputMaybe<PositionFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum MemberNewsCategoryModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  category_ASC = 'category_ASC',
  category_DESC = 'category_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Medlemskategori (member_news_category) */
type MemberNewsCategoryRecord = RecordInterface & {
  __typename?: 'MemberNewsCategoryRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  category: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  position?: Maybe<Scalars['IntType']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Medlemskategori (member_news_category) */
type MemberNewsCategoryRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type MemberNewsModelContentBlocksField = ButtonRecord | FormRecord | ImageRecord | VideoRecord;

type MemberNewsModelContentField = {
  __typename?: 'MemberNewsModelContentField';
  blocks: Array<MemberNewsModelContentBlocksField>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

type MemberNewsModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<MemberNewsModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<MemberNewsModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  blackHeadline?: InputMaybe<BooleanFilter>;
  category?: InputMaybe<LinkFilter>;
  content?: InputMaybe<StructuredTextFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  date?: InputMaybe<DateFilter>;
  dateEnd?: InputMaybe<DateFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  intro?: InputMaybe<TextFilter>;
  location?: InputMaybe<StringFilter>;
  region?: InputMaybe<LinkFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum MemberNewsModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  blackHeadline_ASC = 'blackHeadline_ASC',
  blackHeadline_DESC = 'blackHeadline_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  dateEnd_ASC = 'dateEnd_ASC',
  dateEnd_DESC = 'dateEnd_DESC',
  date_ASC = 'date_ASC',
  date_DESC = 'date_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  location_ASC = 'location_ASC',
  location_DESC = 'location_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Aktuellt (member_news) */
type MemberNewsRecord = RecordInterface & {
  __typename?: 'MemberNewsRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  blackHeadline?: Maybe<Scalars['BooleanType']>;
  category: MemberNewsCategoryRecord;
  content: MemberNewsModelContentField;
  createdAt: Scalars['DateTime'];
  date: Scalars['Date'];
  dateEnd?: Maybe<Scalars['Date']>;
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  intro: Scalars['String'];
  location?: Maybe<Scalars['String']>;
  region: RegionRecord;
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Aktuellt (member_news) */
type MemberNewsRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Aktuellt (member_news) */
type MemberNewsRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Record of type Medlem (member) */
type MemberRecord = RecordInterface & {
  __typename?: 'MemberRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  active?: Maybe<Scalars['BooleanType']>;
  application?: Maybe<ApplicationRecord>;
  bio?: Maybe<Scalars['String']>;
  birthPlace?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  content: Array<MemberModelContentField>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  instagram?: Maybe<Scalars['String']>;
  lastName: Scalars['String'];
  memberCategory: Array<MemberCategoryRecord>;
  password?: Maybe<Scalars['String']>;
  region: RegionRecord;
  resettoken?: Maybe<Scalars['String']>;
  showContact?: Maybe<Scalars['BooleanType']>;
  slug: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  webpage?: Maybe<Scalars['String']>;
  yearOfBirth?: Maybe<Scalars['String']>;
};


/** Record of type Medlem (member) */
type MemberRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Medlem (member) */
type MemberRecordbioArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Record of type Medlemslista (members_list) */
type MembersListRecord = RecordInterface & {
  __typename?: 'MembersListRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  intro?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Medlemslista (members_list) */
type MembersListRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Medlemslista (members_list) */
type MembersListRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Block of type Meta (meta_block) */
type MetaBlockRecord = RecordInterface & {
  __typename?: 'MetaBlockRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  text: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Block of type Meta (meta_block) */
type MetaBlockRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

enum MuxThumbnailFormatType {
  gif = 'gif',
  jpg = 'jpg',
  png = 'png'
}

type NewsModelContentBlocksField = ImageRecord | RelatedMemberNewsRecord;

type NewsModelContentField = {
  __typename?: 'NewsModelContentField';
  blocks: Array<NewsModelContentBlocksField>;
  inlineBlocks: Array<Scalars['String']>;
  links: Array<Scalars['String']>;
  value: Scalars['JsonField'];
};

type NewsModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<NewsModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<NewsModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  blackHeadline?: InputMaybe<BooleanFilter>;
  content?: InputMaybe<StructuredTextFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  intro?: InputMaybe<TextFilter>;
  region?: InputMaybe<LinkFilter>;
  showImage?: InputMaybe<BooleanFilter>;
  slug?: InputMaybe<SlugFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum NewsModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  blackHeadline_ASC = 'blackHeadline_ASC',
  blackHeadline_DESC = 'blackHeadline_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  showImage_ASC = 'showImage_ASC',
  showImage_DESC = 'showImage_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Nyheter (news) */
type NewsRecord = RecordInterface & {
  __typename?: 'NewsRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  blackHeadline?: Maybe<Scalars['BooleanType']>;
  content?: Maybe<NewsModelContentField>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image?: Maybe<FileField>;
  intro: Scalars['String'];
  region: RegionRecord;
  showImage?: Maybe<Scalars['BooleanType']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** Record of type Nyheter (news) */
type NewsRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Nyheter (news) */
type NewsRecordintroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Specifies how to filter by image orientation */
type OrientationFilter = {
  /** Search uploads with the specified orientation */
  eq?: InputMaybe<UploadOrientation>;
  /** Exclude uploads with the specified orientation */
  neq?: InputMaybe<UploadOrientation>;
};

/** Block of type Pdf fil (pdf_form) */
type PdfFormRecord = RecordInterface & {
  __typename?: 'PdfFormRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Pdf fil (pdf_form) */
type PdfFormRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter by position (sorted and tree-like collections) */
type PositionFilter = {
  /** Search for records with an exact match */
  eq?: InputMaybe<Scalars['IntType']>;
  /** Filter records with a value that's strictly greater than the one specified */
  gt?: InputMaybe<Scalars['IntType']>;
  /** Filter records with a value that's greater than or equal to the one specified */
  gte?: InputMaybe<Scalars['IntType']>;
  /** Filter records with a value that's less than the one specified */
  lt?: InputMaybe<Scalars['IntType']>;
  /** Filter records with a value that's less or equal than the one specified */
  lte?: InputMaybe<Scalars['IntType']>;
  /** Exclude records with an exact match */
  neq?: InputMaybe<Scalars['IntType']>;
};

type ProjectModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<ProjectModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ProjectModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  image?: InputMaybe<FileFilter>;
  position?: InputMaybe<PositionFilter>;
  region?: InputMaybe<LinkFilter>;
  text?: InputMaybe<TextFilter>;
  title?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
  url?: InputMaybe<StringFilter>;
};

enum ProjectModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC',
  url_ASC = 'url_ASC',
  url_DESC = 'url_DESC'
}

/** Record of type Initiativ (project) */
type ProjectRecord = RecordInterface & {
  __typename?: 'ProjectRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image: FileField;
  position?: Maybe<Scalars['IntType']>;
  region?: Maybe<RegionRecord>;
  text: Scalars['String'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  url: Scalars['String'];
};


/** Record of type Initiativ (project) */
type ProjectRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Initiativ (project) */
type ProjectRecordtextArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Specifies how to filter by publication datetime */
type PublishedAtFilter = {
  /** Filter records with a value that's within the specified minute range. Seconds and milliseconds are truncated from the argument. */
  eq?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with a value that's strictly greater than the one specified. Seconds and milliseconds are truncated from the argument. */
  gt?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's greater than or equal to than the one specified. Seconds and milliseconds are truncated from the argument. */
  gte?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's less than the one specified. Seconds and milliseconds are truncated from the argument. */
  lt?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's less or equal than the one specified. Seconds and milliseconds are truncated from the argument. */
  lte?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's outside the specified minute range. Seconds and milliseconds are truncated from the argument. */
  neq?: InputMaybe<Scalars['DateTime']>;
};

/** The query root for this schema */
type Query = {
  __typename?: 'Query';
  /** Returns meta information regarding a record collection */
  _allAboutsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allActivitiesMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allApplicationsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allBoardsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allCommissionCategoriesMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allCommissionsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allConsultantsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allConsultsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allEmployeesMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allForArtistsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allHelpsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allMemberCategoriesMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allMemberNewsCategoriesMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allMemberNewsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allMembersMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allNewsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allProjectsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allRegionsMeta: CollectionMetadata;
  /** Returns meta information regarding an assets collection */
  _allUploadsMeta: CollectionMetadata;
  /** Returns meta information regarding a record collection */
  _allUsersMeta: CollectionMetadata;
  /** Returns the single instance record */
  _site: Site;
  /** Returns a specific record */
  about?: Maybe<AboutRecord>;
  /** Returns a specific record */
  activity?: Maybe<ActivityRecord>;
  /** Returns a collection of records */
  allAbouts: Array<AboutRecord>;
  /** Returns a collection of records */
  allActivities: Array<ActivityRecord>;
  /** Returns a collection of records */
  allApplications: Array<ApplicationRecord>;
  /** Returns a collection of records */
  allBoards: Array<BoardRecord>;
  /** Returns a collection of records */
  allCommissionCategories: Array<CommissionCategoryRecord>;
  /** Returns a collection of records */
  allCommissions: Array<CommissionRecord>;
  /** Returns a collection of records */
  allConsultants: Array<ConsultantRecord>;
  /** Returns a collection of records */
  allConsults: Array<ConsultRecord>;
  /** Returns a collection of records */
  allEmployees: Array<EmployeeRecord>;
  /** Returns a collection of records */
  allForArtists: Array<ForArtistRecord>;
  /** Returns a collection of records */
  allHelps: Array<HelpRecord>;
  /** Returns a collection of records */
  allMemberCategories: Array<MemberCategoryRecord>;
  /** Returns a collection of records */
  allMemberNews: Array<MemberNewsRecord>;
  /** Returns a collection of records */
  allMemberNewsCategories: Array<MemberNewsCategoryRecord>;
  /** Returns a collection of records */
  allMembers: Array<MemberRecord>;
  /** Returns a collection of records */
  allNews: Array<NewsRecord>;
  /** Returns a collection of records */
  allProjects: Array<ProjectRecord>;
  /** Returns a collection of records */
  allRegions: Array<RegionRecord>;
  /** Returns a collection of assets */
  allUploads: Array<FileField>;
  /** Returns a collection of records */
  allUsers: Array<UserRecord>;
  /** Returns a specific record */
  application?: Maybe<ApplicationRecord>;
  /** Returns the single instance record */
  apply?: Maybe<ApplyRecord>;
  /** Returns a specific record */
  board?: Maybe<BoardRecord>;
  /** Returns a specific record */
  commission?: Maybe<CommissionRecord>;
  /** Returns a specific record */
  commissionCategory?: Maybe<CommissionCategoryRecord>;
  /** Returns a specific record */
  consult?: Maybe<ConsultRecord>;
  /** Returns a specific record */
  consultant?: Maybe<ConsultantRecord>;
  /** Returns the single instance record */
  contactIntro?: Maybe<ContactIntroRecord>;
  /** Returns a specific record */
  employee?: Maybe<EmployeeRecord>;
  /** Returns the single instance record */
  footer?: Maybe<FooterRecord>;
  /** Returns a specific record */
  forArtist?: Maybe<ForArtistRecord>;
  /** Returns a specific record */
  help?: Maybe<HelpRecord>;
  /** Returns the single instance record */
  inEnglish?: Maybe<InEnglishRecord>;
  /** Returns the single instance record */
  introInitiative?: Maybe<IntroInitiativeRecord>;
  /** Returns a specific record */
  member?: Maybe<MemberRecord>;
  /** Returns a specific record */
  memberCategory?: Maybe<MemberCategoryRecord>;
  /** Returns a specific record */
  memberNews?: Maybe<MemberNewsRecord>;
  /** Returns a specific record */
  memberNewsCategory?: Maybe<MemberNewsCategoryRecord>;
  /** Returns the single instance record */
  membersList?: Maybe<MembersListRecord>;
  /** Returns a specific record */
  news?: Maybe<NewsRecord>;
  /** Returns a specific record */
  project?: Maybe<ProjectRecord>;
  /** Returns a specific record */
  region?: Maybe<RegionRecord>;
  /** Returns a specific asset */
  upload?: Maybe<FileField>;
  /** Returns a specific record */
  user?: Maybe<UserRecord>;
};


/** The query root for this schema */
type Query_allAboutsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<AboutModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allActivitiesMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ActivityModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allApplicationsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ApplicationModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allBoardsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<BoardModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allCommissionCategoriesMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CommissionCategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allCommissionsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CommissionModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allConsultantsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ConsultantModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allConsultsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ConsultModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allEmployeesMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<EmployeeModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allForArtistsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ForArtistModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allHelpsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<HelpModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allMemberCategoriesMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberCategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allMemberNewsCategoriesMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberNewsCategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allMemberNewsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberNewsModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allMembersMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allNewsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<NewsModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allProjectsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ProjectModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allRegionsMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<RegionModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allUploadsMetaArgs = {
  filter?: InputMaybe<UploadFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_allUsersMetaArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UserModelFilter>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type Query_siteArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type QueryaboutArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<AboutModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<AboutModelOrderBy>>>;
};


/** The query root for this schema */
type QueryactivityArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ActivityModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityModelOrderBy>>>;
};


/** The query root for this schema */
type QueryallAboutsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<AboutModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<AboutModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallActivitiesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ActivityModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ActivityModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallApplicationsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ApplicationModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ApplicationModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallBoardsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<BoardModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<BoardModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallCommissionCategoriesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CommissionCategoryModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CommissionCategoryModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallCommissionsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CommissionModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CommissionModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallConsultantsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ConsultantModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ConsultantModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallConsultsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ConsultModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ConsultModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallEmployeesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<EmployeeModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<EmployeeModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallForArtistsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ForArtistModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ForArtistModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallHelpsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<HelpModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<HelpModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallMemberCategoriesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberCategoryModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberCategoryModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallMemberNewsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberNewsModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberNewsModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallMemberNewsCategoriesArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberNewsCategoryModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberNewsCategoryModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallMembersArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallNewsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<NewsModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<NewsModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallProjectsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ProjectModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ProjectModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallRegionsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<RegionModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<RegionModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallUploadsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UploadFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UploadOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryallUsersArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UserModelFilter>;
  first?: InputMaybe<Scalars['IntType']>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UserModelOrderBy>>>;
  skip?: InputMaybe<Scalars['IntType']>;
};


/** The query root for this schema */
type QueryapplicationArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ApplicationModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ApplicationModelOrderBy>>>;
};


/** The query root for this schema */
type QueryapplyArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type QueryboardArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<BoardModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<BoardModelOrderBy>>>;
};


/** The query root for this schema */
type QuerycommissionArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CommissionModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CommissionModelOrderBy>>>;
};


/** The query root for this schema */
type QuerycommissionCategoryArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<CommissionCategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<CommissionCategoryModelOrderBy>>>;
};


/** The query root for this schema */
type QueryconsultArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ConsultModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ConsultModelOrderBy>>>;
};


/** The query root for this schema */
type QueryconsultantArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ConsultantModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ConsultantModelOrderBy>>>;
};


/** The query root for this schema */
type QuerycontactIntroArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type QueryemployeeArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<EmployeeModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<EmployeeModelOrderBy>>>;
};


/** The query root for this schema */
type QueryfooterArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type QueryforArtistArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ForArtistModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ForArtistModelOrderBy>>>;
};


/** The query root for this schema */
type QueryhelpArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<HelpModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<HelpModelOrderBy>>>;
};


/** The query root for this schema */
type QueryinEnglishArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type QueryintroInitiativeArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type QuerymemberArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberModelOrderBy>>>;
};


/** The query root for this schema */
type QuerymemberCategoryArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberCategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberCategoryModelOrderBy>>>;
};


/** The query root for this schema */
type QuerymemberNewsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberNewsModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberNewsModelOrderBy>>>;
};


/** The query root for this schema */
type QuerymemberNewsCategoryArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<MemberNewsCategoryModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<MemberNewsCategoryModelOrderBy>>>;
};


/** The query root for this schema */
type QuerymembersListArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


/** The query root for this schema */
type QuerynewsArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<NewsModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<NewsModelOrderBy>>>;
};


/** The query root for this schema */
type QueryprojectArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<ProjectModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<ProjectModelOrderBy>>>;
};


/** The query root for this schema */
type QueryregionArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<RegionModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<RegionModelOrderBy>>>;
};


/** The query root for this schema */
type QueryuploadArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UploadFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UploadOrderBy>>>;
};


/** The query root for this schema */
type QueryuserArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  filter?: InputMaybe<UserModelFilter>;
  locale?: InputMaybe<SiteLocale>;
  orderBy?: InputMaybe<Array<InputMaybe<UserModelOrderBy>>>;
};

type RecordInterface = {
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
};


type RecordInterface_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type RegionModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<RegionModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<RegionModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  contactIntro?: InputMaybe<TextFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  email?: InputMaybe<StringFilter>;
  global?: InputMaybe<BooleanFilter>;
  id?: InputMaybe<ItemIdFilter>;
  name?: InputMaybe<StringFilter>;
  position?: InputMaybe<PositionFilter>;
  slug?: InputMaybe<SlugFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum RegionModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  email_ASC = 'email_ASC',
  email_DESC = 'email_DESC',
  global_ASC = 'global_ASC',
  global_DESC = 'global_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  name_ASC = 'name_ASC',
  name_DESC = 'name_DESC',
  position_ASC = 'position_ASC',
  position_DESC = 'position_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

type RegionModelSectionsField = ImageShortcutRecord | LatestMemberNewsRecord | LatestNewsRecord | SelectedCommissionRecord | SelectedMemberRecord | TextRecord;

/** Record of type Region (region) */
type RegionRecord = RecordInterface & {
  __typename?: 'RegionRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  contactIntro?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  email?: Maybe<Scalars['String']>;
  gallery: Array<SlideRecord>;
  global?: Maybe<Scalars['BooleanType']>;
  id: Scalars['ItemId'];
  info: Array<MetaBlockRecord>;
  name: Scalars['String'];
  position?: Maybe<Scalars['IntType']>;
  sections: Array<RegionModelSectionsField>;
  slug: Scalars['String'];
  sponsors: Array<SponsorRecord>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Region (region) */
type RegionRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Record of type Region (region) */
type RegionRecordcontactIntroArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Block of type Relaterat på aktuellt (related_member_news) */
type RelatedMemberNewsRecord = RecordInterface & {
  __typename?: 'RelatedMemberNewsRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  memberNews?: Maybe<MemberNewsRecord>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Relaterat på aktuellt (related_member_news) */
type RelatedMemberNewsRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter by upload type */
type ResolutionFilter = {
  /** Search uploads with the specified resolution */
  eq?: InputMaybe<ResolutionType>;
  /** Search uploads with the specified resolutions */
  in?: InputMaybe<Array<InputMaybe<ResolutionType>>>;
  /** Exclude uploads with the specified resolution */
  neq?: InputMaybe<ResolutionType>;
  /** Search uploads without the specified resolutions */
  notIn?: InputMaybe<Array<InputMaybe<ResolutionType>>>;
};

enum ResolutionType {
  icon = 'icon',
  large = 'large',
  medium = 'medium',
  small = 'small'
}

type ResponsiveImage = {
  __typename?: 'ResponsiveImage';
  alt?: Maybe<Scalars['String']>;
  aspectRatio: Scalars['FloatType'];
  base64?: Maybe<Scalars['String']>;
  bgColor?: Maybe<Scalars['String']>;
  height: Scalars['IntType'];
  sizes: Scalars['String'];
  src: Scalars['String'];
  srcSet: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  webpSrcSet: Scalars['String'];
  width: Scalars['IntType'];
};

/** Block of type Utvalda uppdrag (selected_commission) */
type SelectedCommissionRecord = RecordInterface & {
  __typename?: 'SelectedCommissionRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  commissions: Array<CommissionRecord>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  updatedAt: Scalars['DateTime'];
};


/** Block of type Utvalda uppdrag (selected_commission) */
type SelectedCommissionRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Block of type Utvalda konstnärer (selected_member) */
type SelectedMemberRecord = RecordInterface & {
  __typename?: 'SelectedMemberRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  selectedMembers: Array<MemberRecord>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Utvalda konstnärer (selected_member) */
type SelectedMemberRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type SeoField = {
  __typename?: 'SeoField';
  description?: Maybe<Scalars['String']>;
  image?: Maybe<FileField>;
  noIndex?: Maybe<Scalars['BooleanType']>;
  title?: Maybe<Scalars['String']>;
  twitterCard?: Maybe<Scalars['String']>;
};

type Site = {
  __typename?: 'Site';
  favicon?: Maybe<FileField>;
  faviconMetaTags: Array<Tag>;
  globalSeo?: Maybe<GlobalSeoField>;
  locales: Array<SiteLocale>;
  noIndex?: Maybe<Scalars['BooleanType']>;
};


type SitefaviconMetaTagsArgs = {
  variants?: InputMaybe<Array<InputMaybe<FaviconType>>>;
};


type SiteglobalSeoArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

enum SiteLocale {
  en = 'en'
}

type SlideModelLinkField = AboutRecord | CommissionRecord | ForArtistRecord | MemberNewsRecord | NewsRecord;

/** Block of type Slide (slide) */
type SlideRecord = RecordInterface & {
  __typename?: 'SlideRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  blackText?: Maybe<Scalars['BooleanType']>;
  createdAt: Scalars['DateTime'];
  headline?: Maybe<Scalars['String']>;
  id: Scalars['ItemId'];
  image: FileField;
  link?: Maybe<SlideModelLinkField>;
  updatedAt: Scalars['DateTime'];
};


/** Block of type Slide (slide) */
type SlideRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter Slug fields */
type SlugFilter = {
  /** Search for records with an exact match */
  eq?: InputMaybe<Scalars['String']>;
  /** Filter records that have one of the specified slugs */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude records with an exact match */
  neq?: InputMaybe<Scalars['String']>;
  /** Filter records that do have one of the specified slugs */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/** Block of type Sponsor (sponsor) */
type SponsorRecord = RecordInterface & {
  __typename?: 'SponsorRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  image: FileField;
  updatedAt: Scalars['DateTime'];
  url: Scalars['String'];
};


/** Block of type Sponsor (sponsor) */
type SponsorRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter by status */
type StatusFilter = {
  /** Search the record with the specified status */
  eq?: InputMaybe<ItemStatus>;
  /** Search records with the specified statuses */
  in?: InputMaybe<Array<InputMaybe<ItemStatus>>>;
  /** Exclude the record with the specified status */
  neq?: InputMaybe<ItemStatus>;
  /** Search records without the specified statuses */
  notIn?: InputMaybe<Array<InputMaybe<ItemStatus>>>;
};

/** Specifies how to filter Single-line string fields */
type StringFilter = {
  /** Search for records with an exact match */
  eq?: InputMaybe<Scalars['String']>;
  /** Filter records with the specified field defined (i.e. with any value) or not [DEPRECATED] */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records that equal one of the specified values */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter records with the specified field set as blank (null or empty string) */
  isBlank?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with the specified field present (neither null, nor empty string) */
  isPresent?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude records with an exact match */
  neq?: InputMaybe<Scalars['String']>;
  /** Filter records that do not equal one of the specified values */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude records based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

type StringMatchesFilter = {
  caseSensitive?: InputMaybe<Scalars['BooleanType']>;
  pattern: Scalars['String'];
  regexp?: InputMaybe<Scalars['BooleanType']>;
};

/** Specifies how to filter Structured Text fields values */
type StructuredTextFilter = {
  /** Filter records with the specified field defined (i.e. with any value) or not [DEPRECATED] */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with the specified field set as blank (null or single empty paragraph) */
  isBlank?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with the specified field present (neither null, nor empty string) */
  isPresent?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude records based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

type Tag = {
  __typename?: 'Tag';
  attributes?: Maybe<Scalars['MetaTagAttributes']>;
  content?: Maybe<Scalars['String']>;
  tag: Scalars['String'];
};

/** Specifies how to filter text fields */
type TextFilter = {
  /** Filter records with the specified field defined (i.e. with any value) or not [DEPRECATED] */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with the specified field set as blank (null or empty string) */
  isBlank?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with the specified field present (neither null, nor empty string) */
  isPresent?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude records based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

/** Block of type Text (text) */
type TextRecord = RecordInterface & {
  __typename?: 'TextRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  headline?: Maybe<Scalars['String']>;
  id: Scalars['ItemId'];
  text?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  url?: Maybe<Scalars['String']>;
};


/** Block of type Text (text) */
type TextRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};


/** Block of type Text (text) */
type TextRecordtextArgs = {
  markdown?: InputMaybe<Scalars['Boolean']>;
};

/** Specifies how to filter by upload type */
type TypeFilter = {
  /** Search uploads with the specified type */
  eq?: InputMaybe<UploadType>;
  /** Search uploads with the specified types */
  in?: InputMaybe<Array<InputMaybe<UploadType>>>;
  /** Exclude uploads with the specified type */
  neq?: InputMaybe<UploadType>;
  /** Search uploads without the specified types */
  notIn?: InputMaybe<Array<InputMaybe<UploadType>>>;
};

/** Specifies how to filter by update datetime */
type UpdatedAtFilter = {
  /** Filter records with a value that's within the specified minute range. Seconds and milliseconds are truncated from the argument. */
  eq?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter records with a value that's strictly greater than the one specified. Seconds and milliseconds are truncated from the argument. */
  gt?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's greater than or equal to than the one specified. Seconds and milliseconds are truncated from the argument. */
  gte?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's less than the one specified. Seconds and milliseconds are truncated from the argument. */
  lt?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's less or equal than the one specified. Seconds and milliseconds are truncated from the argument. */
  lte?: InputMaybe<Scalars['DateTime']>;
  /** Filter records with a value that's outside the specified minute range. Seconds and milliseconds are truncated from the argument. */
  neq?: InputMaybe<Scalars['DateTime']>;
};

/** Specifies how to filter by default alt */
type UploadAltFilter = {
  /** Search the uploads with the specified alt */
  eq?: InputMaybe<Scalars['String']>;
  /** Filter uploads with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Search uploads with the specified values as default alt */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude the uploads with the specified alt */
  neq?: InputMaybe<Scalars['String']>;
  /** Search uploads that do not have the specified values as default alt */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

/** Specifies how to filter by auhtor */
type UploadAuthorFilter = {
  /** Filter uploads with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

/** Specifies how to filter by basename */
type UploadBasenameFilter = {
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

/** Specifies how to filter by colors */
type UploadColorsFilter = {
  /** Filter uploads that have all of the specified colors */
  allIn?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
  /** Filter uploads that have at least one of the specified colors */
  anyIn?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
  /** Filter uploads that have the specified colors */
  contains?: InputMaybe<ColorBucketType>;
  /** Search for uploads with an exact match */
  eq?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
  /** Filter uploads that do not have any of the specified colors */
  notIn?: InputMaybe<Array<InputMaybe<ColorBucketType>>>;
};

/** Specifies how to filter by copyright */
type UploadCopyrightFilter = {
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

/** Specifies how to filter by creation datetime */
type UploadCreatedAtFilter = {
  /** Search for uploads with an exact match */
  eq?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's strictly greater than the one specified */
  gt?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's greater than or equal to the one specified */
  gte?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's less than the one specified */
  lt?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's less or equal than the one specified */
  lte?: InputMaybe<Scalars['DateTime']>;
  /** Exclude uploads with an exact match */
  neq?: InputMaybe<Scalars['DateTime']>;
};

/** Specifies how to filter by filename */
type UploadFilenameFilter = {
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

type UploadFilter = {
  AND?: InputMaybe<Array<InputMaybe<UploadFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UploadFilter>>>;
  _createdAt?: InputMaybe<UploadCreatedAtFilter>;
  _updatedAt?: InputMaybe<UploadUpdatedAtFilter>;
  alt?: InputMaybe<UploadAltFilter>;
  author?: InputMaybe<UploadAuthorFilter>;
  basename?: InputMaybe<UploadBasenameFilter>;
  colors?: InputMaybe<UploadColorsFilter>;
  copyright?: InputMaybe<UploadCopyrightFilter>;
  filename?: InputMaybe<UploadFilenameFilter>;
  format?: InputMaybe<UploadFormatFilter>;
  height?: InputMaybe<UploadHeightFilter>;
  id?: InputMaybe<UploadIdFilter>;
  inUse?: InputMaybe<InUseFilter>;
  md5?: InputMaybe<UploadMd5Filter>;
  mimeType?: InputMaybe<UploadMimeTypeFilter>;
  notes?: InputMaybe<UploadNotesFilter>;
  orientation?: InputMaybe<OrientationFilter>;
  path?: InputMaybe<UploadPathFilter>;
  resolution?: InputMaybe<ResolutionFilter>;
  size?: InputMaybe<UploadSizeFilter>;
  smartTags?: InputMaybe<UploadTagsFilter>;
  tags?: InputMaybe<UploadTagsFilter>;
  title?: InputMaybe<UploadTitleFilter>;
  type?: InputMaybe<TypeFilter>;
  width?: InputMaybe<UploadWidthFilter>;
};

/** Specifies how to filter by format */
type UploadFormatFilter = {
  /** Search the asset with the specified format */
  eq?: InputMaybe<Scalars['String']>;
  /** Search assets with the specified formats */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude the asset with the specified format */
  neq?: InputMaybe<Scalars['String']>;
  /** Search assets that do not have the specified formats */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/** Specifies how to filter by height */
type UploadHeightFilter = {
  /** Search assets with the specified height */
  eq?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger than the specified height */
  gt?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger or equal to the specified height */
  gte?: InputMaybe<Scalars['IntType']>;
  /** Search all assets smaller than the specified height */
  lt?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger or equal to the specified height */
  lte?: InputMaybe<Scalars['IntType']>;
  /** Search assets that do not have the specified height */
  neq?: InputMaybe<Scalars['IntType']>;
};

/** Specifies how to filter by ID */
type UploadIdFilter = {
  /** Search the asset with the specified ID */
  eq?: InputMaybe<Scalars['UploadId']>;
  /** Search assets with the specified IDs */
  in?: InputMaybe<Array<InputMaybe<Scalars['UploadId']>>>;
  /** Exclude the asset with the specified ID */
  neq?: InputMaybe<Scalars['UploadId']>;
  /** Search assets that do not have the specified IDs */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['UploadId']>>>;
};

/** Specifies how to filter by MD5 */
type UploadMd5Filter = {
  /** Search the asset with the specified MD5 */
  eq?: InputMaybe<Scalars['String']>;
  /** Search assets with the specified MD5s */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude the asset with the specified MD5 */
  neq?: InputMaybe<Scalars['String']>;
  /** Search assets that do not have the specified MD5s */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/** Specifies how to filter by mime type */
type UploadMimeTypeFilter = {
  /** Search the asset with the specified mime type */
  eq?: InputMaybe<Scalars['String']>;
  /** Search assets with the specified mime types */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude the asset with the specified mime type */
  neq?: InputMaybe<Scalars['String']>;
  /** Search assets that do not have the specified mime types */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

/** Specifies how to filter by notes */
type UploadNotesFilter = {
  /** Filter records with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

enum UploadOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  basename_ASC = 'basename_ASC',
  basename_DESC = 'basename_DESC',
  filename_ASC = 'filename_ASC',
  filename_DESC = 'filename_DESC',
  format_ASC = 'format_ASC',
  format_DESC = 'format_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  mimeType_ASC = 'mimeType_ASC',
  mimeType_DESC = 'mimeType_DESC',
  resolution_ASC = 'resolution_ASC',
  resolution_DESC = 'resolution_DESC',
  size_ASC = 'size_ASC',
  size_DESC = 'size_DESC'
}

enum UploadOrientation {
  landscape = 'landscape',
  portrait = 'portrait',
  square = 'square'
}

/** Specifies how to filter by path */
type UploadPathFilter = {
  /** Search the asset with the specified path */
  eq?: InputMaybe<Scalars['String']>;
  /** Search assets with the specified paths */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude the asset with the specified path */
  neq?: InputMaybe<Scalars['String']>;
  /** Search assets that do not have the specified paths */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/** Specifies how to filter by size */
type UploadSizeFilter = {
  /** Search assets with the specified size (in bytes) */
  eq?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger than the specified size (in bytes) */
  gt?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger or equal to the specified size (in bytes) */
  gte?: InputMaybe<Scalars['IntType']>;
  /** Search all assets smaller than the specified size (in bytes) */
  lt?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger or equal to the specified size (in bytes) */
  lte?: InputMaybe<Scalars['IntType']>;
  /** Search assets that do not have the specified size (in bytes) */
  neq?: InputMaybe<Scalars['IntType']>;
};

/** Specifies how to filter by tags */
type UploadTagsFilter = {
  /** Filter uploads linked to all of the specified tags */
  allIn?: InputMaybe<Array<Scalars['String']>>;
  /** Filter uploads linked to at least one of the specified tags */
  anyIn?: InputMaybe<Array<Scalars['String']>>;
  /** Filter uploads linked to the specified tag */
  contains?: InputMaybe<Scalars['String']>;
  /** Search for uploads with an exact match */
  eq?: InputMaybe<Array<Scalars['String']>>;
  /** Filter uploads not linked to any of the specified tags */
  notIn?: InputMaybe<Array<Scalars['String']>>;
};

/** Specifies how to filter by default title */
type UploadTitleFilter = {
  /** Search the asset with the specified title */
  eq?: InputMaybe<Scalars['String']>;
  /** Filter assets with the specified field defined (i.e. with any value) or not */
  exists?: InputMaybe<Scalars['BooleanType']>;
  /** Search assets with the specified as default title */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter uploads based on a regular expression */
  matches?: InputMaybe<StringMatchesFilter>;
  /** Exclude the asset with the specified title */
  neq?: InputMaybe<Scalars['String']>;
  /** Search assets that do not have the specified as default title */
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Exclude uploads based on a regular expression */
  notMatches?: InputMaybe<StringMatchesFilter>;
};

enum UploadType {
  archive = 'archive',
  audio = 'audio',
  image = 'image',
  pdfdocument = 'pdfdocument',
  presentation = 'presentation',
  richtext = 'richtext',
  spreadsheet = 'spreadsheet',
  video = 'video'
}

/** Specifies how to filter by update datetime */
type UploadUpdatedAtFilter = {
  /** Search for uploads with an exact match */
  eq?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's strictly greater than the one specified */
  gt?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's greater than or equal to the one specified */
  gte?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's less than the one specified */
  lt?: InputMaybe<Scalars['DateTime']>;
  /** Filter uploads with a value that's less or equal than the one specified */
  lte?: InputMaybe<Scalars['DateTime']>;
  /** Exclude uploads with an exact match */
  neq?: InputMaybe<Scalars['DateTime']>;
};

type UploadVideoField = {
  __typename?: 'UploadVideoField';
  alt?: Maybe<Scalars['String']>;
  blurUpThumb?: Maybe<Scalars['String']>;
  blurhash?: Maybe<Scalars['String']>;
  duration?: Maybe<Scalars['Int']>;
  framerate?: Maybe<Scalars['Int']>;
  height: Scalars['IntType'];
  mp4Url?: Maybe<Scalars['String']>;
  muxAssetId: Scalars['String'];
  muxPlaybackId: Scalars['String'];
  streamingUrl: Scalars['String'];
  thumbhash?: Maybe<Scalars['String']>;
  thumbnailUrl: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  width: Scalars['IntType'];
};


type UploadVideoFieldaltArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};


type UploadVideoFieldblurUpThumbArgs = {
  imgixParams?: InputMaybe<ImgixParams>;
  punch?: Scalars['Float'];
  quality?: Scalars['Int'];
  size?: Scalars['Int'];
};


type UploadVideoFieldmp4UrlArgs = {
  exactRes?: InputMaybe<VideoMp4Res>;
  res?: InputMaybe<VideoMp4Res>;
};


type UploadVideoFieldthumbnailUrlArgs = {
  format?: InputMaybe<MuxThumbnailFormatType>;
};


type UploadVideoFieldtitleArgs = {
  fallbackLocales?: InputMaybe<Array<SiteLocale>>;
  locale?: InputMaybe<SiteLocale>;
};

/** Specifies how to filter by width */
type UploadWidthFilter = {
  /** Search assets with the specified width */
  eq?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger than the specified width */
  gt?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger or equal to the specified width */
  gte?: InputMaybe<Scalars['IntType']>;
  /** Search all assets smaller than the specified width */
  lt?: InputMaybe<Scalars['IntType']>;
  /** Search all assets larger or equal to the specified width */
  lte?: InputMaybe<Scalars['IntType']>;
  /** Search assets that do not have the specified width */
  neq?: InputMaybe<Scalars['IntType']>;
};

type UserModelFilter = {
  AND?: InputMaybe<Array<InputMaybe<UserModelFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<UserModelFilter>>>;
  _createdAt?: InputMaybe<CreatedAtFilter>;
  _firstPublishedAt?: InputMaybe<PublishedAtFilter>;
  _isValid?: InputMaybe<BooleanFilter>;
  _publicationScheduledAt?: InputMaybe<PublishedAtFilter>;
  _publishedAt?: InputMaybe<PublishedAtFilter>;
  _status?: InputMaybe<StatusFilter>;
  _unpublishingScheduledAt?: InputMaybe<PublishedAtFilter>;
  _updatedAt?: InputMaybe<UpdatedAtFilter>;
  createdAt?: InputMaybe<CreatedAtFilter>;
  id?: InputMaybe<ItemIdFilter>;
  member?: InputMaybe<LinkFilter>;
  password?: InputMaybe<StringFilter>;
  resetToken?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<UpdatedAtFilter>;
};

enum UserModelOrderBy {
  _createdAt_ASC = '_createdAt_ASC',
  _createdAt_DESC = '_createdAt_DESC',
  _firstPublishedAt_ASC = '_firstPublishedAt_ASC',
  _firstPublishedAt_DESC = '_firstPublishedAt_DESC',
  _isValid_ASC = '_isValid_ASC',
  _isValid_DESC = '_isValid_DESC',
  _publicationScheduledAt_ASC = '_publicationScheduledAt_ASC',
  _publicationScheduledAt_DESC = '_publicationScheduledAt_DESC',
  _publishedAt_ASC = '_publishedAt_ASC',
  _publishedAt_DESC = '_publishedAt_DESC',
  _status_ASC = '_status_ASC',
  _status_DESC = '_status_DESC',
  _unpublishingScheduledAt_ASC = '_unpublishingScheduledAt_ASC',
  _unpublishingScheduledAt_DESC = '_unpublishingScheduledAt_DESC',
  _updatedAt_ASC = '_updatedAt_ASC',
  _updatedAt_DESC = '_updatedAt_DESC',
  createdAt_ASC = 'createdAt_ASC',
  createdAt_DESC = 'createdAt_DESC',
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  password_ASC = 'password_ASC',
  password_DESC = 'password_DESC',
  resetToken_ASC = 'resetToken_ASC',
  resetToken_DESC = 'resetToken_DESC',
  updatedAt_ASC = 'updatedAt_ASC',
  updatedAt_DESC = 'updatedAt_DESC'
}

/** Record of type Användare (user) */
type UserRecord = RecordInterface & {
  __typename?: 'UserRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  member: MemberRecord;
  password: Scalars['String'];
  resetToken?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};


/** Record of type Användare (user) */
type UserRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type VideoField = {
  __typename?: 'VideoField';
  height: Scalars['IntType'];
  provider: Scalars['String'];
  providerUid: Scalars['String'];
  thumbnailUrl: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
  width: Scalars['IntType'];
};

enum VideoMp4Res {
  high = 'high',
  low = 'low',
  medium = 'medium'
}

/** Block of type Video (video) */
type VideoRecord = RecordInterface & {
  __typename?: 'VideoRecord';
  _createdAt: Scalars['DateTime'];
  /** Editing URL */
  _editingUrl?: Maybe<Scalars['String']>;
  _firstPublishedAt: Scalars['DateTime'];
  _isValid: Scalars['BooleanType'];
  _modelApiKey: Scalars['String'];
  _publicationScheduledAt?: Maybe<Scalars['DateTime']>;
  _publishedAt: Scalars['DateTime'];
  /** Generates SEO and Social card meta tags to be used in your frontend */
  _seoMetaTags: Array<Tag>;
  _status: ItemStatus;
  _unpublishingScheduledAt?: Maybe<Scalars['DateTime']>;
  _updatedAt: Scalars['DateTime'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ItemId'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  video?: Maybe<VideoField>;
};


/** Block of type Video (video) */
type VideoRecord_seoMetaTagsArgs = {
  locale?: InputMaybe<SiteLocale>;
};

type focalPoint = {
  __typename?: 'focalPoint';
  x: Scalars['FloatType'];
  y: Scalars['FloatType'];
};

type AboutQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


type AboutQuery = { __typename?: 'Query', about?: { __typename: 'AboutRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'AboutModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type AllAboutsQueryVariables = Exact<{ [key: string]: never; }>;


type AllAboutsQuery = { __typename?: 'Query', abouts: Array<{ __typename: 'AboutRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'AboutModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> }> };

type AllAboutsMenuQueryVariables = Exact<{ [key: string]: never; }>;


type AllAboutsMenuQuery = { __typename?: 'Query', abouts: Array<{ __typename?: 'AboutRecord', title: string, slug: string }> };

type CommissionQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


type CommissionQuery = { __typename?: 'Query', commission?: { __typename: 'CommissionRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, city: string, year: string, artist: string, consultant: string, work?: string | null, commissioner?: string | null, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'CommissionCategoryRecord', id: any, title: string }, content: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }>, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type AllCommissionsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type AllCommissionsQuery = { __typename?: 'Query', commissions: Array<{ __typename: 'CommissionRecord', _modelApiKey: string, id: any, title: string, slug: string, city: string, year: string, artist: string, consultant: string, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'CommissionCategoryRecord', id: any, title: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type AllCommissionsMenuQueryVariables = Exact<{ [key: string]: never; }>;


type AllCommissionsMenuQuery = { __typename?: 'Query', commissions: Array<{ __typename?: 'CommissionRecord', title: string, slug: string }> };

type AllCommissionCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


type AllCommissionCategoriesQuery = { __typename?: 'Query', commissionCategories: Array<{ __typename?: 'CommissionCategoryRecord', id: any, title: string }> };

type LatestCommissionsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type LatestCommissionsQuery = { __typename?: 'Query', commissions: Array<{ __typename: 'CommissionRecord', _modelApiKey: string, id: any, title: string, slug: string, city: string, year: string, artist: string, consultant: string, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'CommissionCategoryRecord', id: any, title: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }> };

type RelatedCommissionsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
  commissionId?: InputMaybe<Scalars['ItemId']>;
}>;


type RelatedCommissionsQuery = { __typename?: 'Query', commissions: Array<{ __typename: 'CommissionRecord', _modelApiKey: string, id: any, title: string, slug: string, city: string, year: string, artist: string, consultant: string, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'CommissionCategoryRecord', id: any, title: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }> };

type ConsultQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


type ConsultQuery = { __typename?: 'Query', consult?: { __typename: 'ConsultRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'ConsultModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'GalleryRecord', id: any } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type AllConsultsQueryVariables = Exact<{ [key: string]: never; }>;


type AllConsultsQuery = { __typename?: 'Query', consults: Array<{ __typename: 'ConsultRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'ConsultModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'GalleryRecord', id: any } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> }> };

type AllConsultsMenuQueryVariables = Exact<{ [key: string]: never; }>;


type AllConsultsMenuQuery = { __typename?: 'Query', consults: Array<{ __typename?: 'ConsultRecord', title: string, slug: string }> };

type AllConsultantsQueryVariables = Exact<{ [key: string]: never; }>;


type AllConsultantsQuery = { __typename?: 'Query', consultants: Array<{ __typename?: 'ConsultantRecord', id: any, email: string, name: string, title?: string | null }> };

type ContactQueryVariables = Exact<{ [key: string]: never; }>;


type ContactQuery = { __typename?: 'Query', contactIntro?: { __typename?: 'ContactIntroRecord', id: any, board?: string | null, staff?: string | null, consultant?: string | null } | null };

type InEnglishQueryVariables = Exact<{ [key: string]: never; }>;


type InEnglishQuery = { __typename?: 'Query', inEnglish?: { __typename: 'InEnglishRecord', _modelApiKey: string, id: any, title: string, slug: string, content: { __typename?: 'InEnglishModelContentField', value: any, blocks: Array<{ __typename?: 'ButtonRecord' } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'TextRecord', id: any, text?: string | null } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> } } | null };

type FooterQueryVariables = Exact<{ [key: string]: never; }>;


type FooterQuery = { __typename?: 'Query', footer?: { __typename?: 'FooterRecord', aboutKc: string } | null, regions: Array<{ __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, sponsors: Array<{ __typename?: 'SponsorRecord', id: any, url: string, image: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } }> }> };

type ForArtistFragment = { __typename?: 'ForArtistRecord', id: any, createdAt: any, slug: string, title: string, intro?: string | null, content?: { __typename?: 'ForArtistModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> } | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null };

type AllForArtistQueryVariables = Exact<{ [key: string]: never; }>;


type AllForArtistQuery = { __typename?: 'Query', forArtists: Array<{ __typename?: 'ForArtistRecord', id: any, createdAt: any, slug: string, title: string }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type ForArtistQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


type ForArtistQuery = { __typename?: 'Query', forArtist?: { __typename?: 'ForArtistRecord', id: any, createdAt: any, slug: string, title: string, intro?: string | null, content?: { __typename?: 'ForArtistModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> } | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null } | null };

type AboutFragment = { __typename: 'AboutRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'AboutModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> };

type CommissionFragment = { __typename: 'CommissionRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, city: string, year: string, artist: string, consultant: string, work?: string | null, commissioner?: string | null, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'CommissionCategoryRecord', id: any, title: string }, content: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }>, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> };

type CommissionLightFragment = { __typename: 'CommissionRecord', _modelApiKey: string, id: any, title: string, slug: string, city: string, year: string, artist: string, consultant: string, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'CommissionCategoryRecord', id: any, title: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } };

type ConsultFragment = { __typename: 'ConsultRecord', _modelApiKey: string, id: any, title: string, intro: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'ConsultModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'GalleryRecord', id: any } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> };

type ConsultLightFragment = { __typename: 'ConsultRecord', id: any, title: string, intro: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'ConsultModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'GalleryRecord', id: any } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> } };

type ImageFragment = { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null };

type ImageMediumFragment = { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null };

type ImageThumbnailFragment = { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null };

type MediaGalleryFragment = { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null };

type MemberFragment = { __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, bio?: string | null, yearOfBirth?: string | null, birthPlace?: string | null, city?: string | null, webpage?: string | null, instagram?: string | null, active?: any | null, showContact?: any | null, slug: string, resettoken?: string | null, _status: ItemStatus, _firstPublishedAt: any, memberCategory: Array<{ __typename?: 'MemberCategoryRecord', id: any, categoryType: string }>, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, content: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }>, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> };

type MemberLightFragment = { __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, slug: string, _status: ItemStatus, _firstPublishedAt: any, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null };

type MemberNewsFragment = { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, blackHeadline?: any | null, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, content: { __typename?: 'MemberNewsModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'FormRecord', id: any, subject?: string | null, reciever?: string | null, confirmation: string, formFields: Array<{ __typename: 'FormTextRecord', id: any, title?: string | null } | { __typename: 'FormTextblockRecord', id: any, title?: string | null } | { __typename: 'PdfFormRecord', id: any, title?: string | null }> } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> };

type MemberNewsLightFragment = { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } };

type NewsFragment = { __typename: 'NewsRecord', _modelApiKey: string, id: any, title: string, slug: string, intro: string, createdAt: any, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, content?: { __typename?: 'NewsModelContentField', value: any, blocks: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'RelatedMemberNewsRecord', id: any, memberNews?: { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, blackHeadline?: any | null, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, content: { __typename?: 'MemberNewsModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'FormRecord', id: any, subject?: string | null, reciever?: string | null, confirmation: string, formFields: Array<{ __typename: 'FormTextRecord', id: any, title?: string | null } | { __typename: 'FormTextblockRecord', id: any, title?: string | null } | { __typename: 'PdfFormRecord', id: any, title?: string | null }> } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null }> } | null, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> };

type ProjectFragment = { __typename: 'ProjectRecord', _modelApiKey: string, title: string, url: string, text: string, image: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null }, region?: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } | null, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> };

type RegionFragment = { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null };

type SiteFragment = { __typename?: 'Site', favicon: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }>, globalSeo?: { __typename?: 'GlobalSeoField', facebookPageUrl?: string | null, siteName?: string | null, titleSuffix?: string | null, twitterAccount?: string | null, fallbackSeo?: { __typename?: 'SeoField', description?: string | null, title?: string | null, twitterCard?: string | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null } | null } | null };

type VideoFragment = { __typename?: 'FileField', id: any, alt?: string | null, basename: string, format: string, mimeType: string, size: any, title?: string | null, url: string, width?: any | null, height?: any | null, video?: { __typename?: 'UploadVideoField', thumbnailUrl: string, streamingUrl: string, framerate?: number | null, duration?: number | null, mp4high?: string | null, mp4med?: string | null, mp4low?: string | null } | null };

type GlobalQueryVariables = Exact<{ [key: string]: never; }>;


type GlobalQuery = { __typename?: 'Query', site: { __typename?: 'Site', favicon: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }>, globalSeo?: { __typename?: 'GlobalSeoField', facebookPageUrl?: string | null, siteName?: string | null, titleSuffix?: string | null, twitterAccount?: string | null, fallbackSeo?: { __typename?: 'SeoField', description?: string | null, title?: string | null, twitterCard?: string | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null } | null } | null } };

type AllMembersQueryVariables = Exact<{
  regionId?: InputMaybe<Scalars['ItemId']>;
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
}>;


type AllMembersQuery = { __typename?: 'Query', members: Array<{ __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, slug: string, _status: ItemStatus, _firstPublishedAt: any, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type AllMembersListQueryVariables = Exact<{
  regionId?: InputMaybe<Scalars['ItemId']>;
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
}>;


type AllMembersListQuery = { __typename?: 'Query', members: Array<{ __typename?: 'MemberRecord', fullName: string, firstName: string, lastName: string, active?: any | null, slug: string, image?: { __typename?: 'FileField', id: any } | null, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type AllMembersWithPortfolioQueryVariables = Exact<{
  regionId?: InputMaybe<Scalars['ItemId']>;
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
}>;


type AllMembersWithPortfolioQuery = { __typename?: 'Query', members: Array<{ __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, slug: string, _status: ItemStatus, _firstPublishedAt: any, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type AllMembersCitiesQueryVariables = Exact<{ [key: string]: never; }>;


type AllMembersCitiesQuery = { __typename?: 'Query', cities: Array<{ __typename?: 'MemberRecord', name?: string | null }> };

type MemberQueryVariables = Exact<{
  email: Scalars['String'];
}>;


type MemberQuery = { __typename?: 'Query', member?: { __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, bio?: string | null, yearOfBirth?: string | null, birthPlace?: string | null, city?: string | null, webpage?: string | null, instagram?: string | null, active?: any | null, showContact?: any | null, slug: string, resettoken?: string | null, _status: ItemStatus, _firstPublishedAt: any, memberCategory: Array<{ __typename?: 'MemberCategoryRecord', id: any, categoryType: string }>, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, content: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }>, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type MemberBySlugQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


type MemberBySlugQuery = { __typename?: 'Query', member?: { __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, bio?: string | null, yearOfBirth?: string | null, birthPlace?: string | null, city?: string | null, webpage?: string | null, instagram?: string | null, active?: any | null, showContact?: any | null, slug: string, resettoken?: string | null, _status: ItemStatus, _firstPublishedAt: any, memberCategory: Array<{ __typename?: 'MemberCategoryRecord', id: any, categoryType: string }>, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, content: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }>, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type MemberByPasswordTokenQueryVariables = Exact<{
  token: Scalars['String'];
}>;


type MemberByPasswordTokenQuery = { __typename?: 'Query', member?: { __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, bio?: string | null, yearOfBirth?: string | null, birthPlace?: string | null, city?: string | null, webpage?: string | null, instagram?: string | null, active?: any | null, showContact?: any | null, slug: string, resettoken?: string | null, _status: ItemStatus, _firstPublishedAt: any, memberCategory: Array<{ __typename?: 'MemberCategoryRecord', id: any, categoryType: string }>, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, content: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }>, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type AllMemberCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


type AllMemberCategoriesQuery = { __typename?: 'Query', memberCategories: Array<{ __typename?: 'MemberCategoryRecord', id: any, categoryType: string }> };

type ApplyForMembershipQueryVariables = Exact<{ [key: string]: never; }>;


type ApplyForMembershipQuery = { __typename?: 'Query', apply?: { __typename?: 'ApplyRecord', id: any, title: string, intro?: string | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, content: { __typename?: 'ApplyModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string }> } } | null };

type MemberNewsQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


type MemberNewsQuery = { __typename?: 'Query', memberNews?: { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, blackHeadline?: any | null, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, content: { __typename?: 'MemberNewsModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'FormRecord', id: any, subject?: string | null, reciever?: string | null, confirmation: string, formFields: Array<{ __typename: 'FormTextRecord', id: any, title?: string | null } | { __typename: 'FormTextblockRecord', id: any, title?: string | null } | { __typename: 'PdfFormRecord', id: any, title?: string | null }> } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type MemberNewsByIdQueryVariables = Exact<{
  id: Scalars['ItemId'];
}>;


type MemberNewsByIdQuery = { __typename?: 'Query', memberNews?: { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, blackHeadline?: any | null, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, content: { __typename?: 'MemberNewsModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'FormRecord', id: any, subject?: string | null, reciever?: string | null, confirmation: string, formFields: Array<{ __typename: 'FormTextRecord', id: any, title?: string | null } | { __typename: 'FormTextblockRecord', id: any, title?: string | null } | { __typename: 'PdfFormRecord', id: any, title?: string | null }> } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type AllMemberNewsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type AllMemberNewsQuery = { __typename?: 'Query', memberNews: Array<{ __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type AllPastAndFutureMemberNewsQueryVariables = Exact<{
  regionId?: InputMaybe<Scalars['ItemId']>;
  categoryId?: InputMaybe<Scalars['ItemId']>;
  date?: InputMaybe<Scalars['Date']>;
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
}>;


type AllPastAndFutureMemberNewsQuery = { __typename?: 'Query', memberNews: Array<{ __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type AllPresentMemberNewsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
  date?: InputMaybe<Scalars['Date']>;
}>;


type AllPresentMemberNewsQuery = { __typename?: 'Query', presentMemberNews: Array<{ __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type MemberImagesQueryVariables = Exact<{
  email: Scalars['String'];
}>;


type MemberImagesQuery = { __typename?: 'Query', member?: { __typename?: 'MemberRecord', content: Array<{ __typename?: 'ImageRecord', image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null }>, thumb: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename?: 'VideoRecord' }> } | null, uploads: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null }>, uploadsThumbs: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null }> };

type AllMemberNewsCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


type AllMemberNewsCategoriesQuery = { __typename?: 'Query', memberNewsCategories: Array<{ __typename?: 'MemberNewsCategoryRecord', id: any, category: string }> };

type LatestMemberNewsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type LatestMemberNewsQuery = { __typename?: 'Query', memberNews: Array<{ __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }> };

type RelatedMembersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
  memberId?: InputMaybe<Scalars['ItemId']>;
}>;


type RelatedMembersQuery = { __typename?: 'Query', members: Array<{ __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, slug: string, _status: ItemStatus, _firstPublishedAt: any, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }> };

type MembersListQueryVariables = Exact<{ [key: string]: never; }>;


type MembersListQuery = { __typename?: 'Query', membersList?: { __typename?: 'MembersListRecord', intro?: string | null } | null };

type AllNewsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type AllNewsQuery = { __typename?: 'Query', news: Array<{ __typename: 'NewsRecord', _modelApiKey: string, id: any, title: string, slug: string, intro: string, createdAt: any, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, content?: { __typename?: 'NewsModelContentField', value: any, blocks: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'RelatedMemberNewsRecord', id: any, memberNews?: { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, blackHeadline?: any | null, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, content: { __typename?: 'MemberNewsModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'FormRecord', id: any, subject?: string | null, reciever?: string | null, confirmation: string, formFields: Array<{ __typename: 'FormTextRecord', id: any, title?: string | null } | { __typename: 'FormTextblockRecord', id: any, title?: string | null } | { __typename: 'PdfFormRecord', id: any, title?: string | null }> } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null }> } | null, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type NewsQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


type NewsQuery = { __typename?: 'Query', news?: { __typename: 'NewsRecord', _modelApiKey: string, id: any, title: string, slug: string, intro: string, createdAt: any, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, content?: { __typename?: 'NewsModelContentField', value: any, blocks: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'RelatedMemberNewsRecord', id: any, memberNews?: { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, blackHeadline?: any | null, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, content: { __typename?: 'MemberNewsModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'FormRecord', id: any, subject?: string | null, reciever?: string | null, confirmation: string, formFields: Array<{ __typename: 'FormTextRecord', id: any, title?: string | null } | { __typename: 'FormTextblockRecord', id: any, title?: string | null } | { __typename: 'PdfFormRecord', id: any, title?: string | null }> } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null }> } | null, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null };

type LatestNewsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type LatestNewsQuery = { __typename?: 'Query', news: Array<{ __typename: 'NewsRecord', _modelApiKey: string, id: any, title: string, slug: string, intro: string, createdAt: any, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, content?: { __typename?: 'NewsModelContentField', value: any, blocks: Array<{ __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'RelatedMemberNewsRecord', id: any, memberNews?: { __typename: 'MemberNewsRecord', _modelApiKey: string, id: any, createdAt: any, title: string, blackHeadline?: any | null, intro: string, date: any, dateEnd?: any | null, location?: string | null, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null, category: { __typename?: 'MemberNewsCategoryRecord', id: any, category: string }, content: { __typename?: 'MemberNewsModelContentField', value: any, blocks: Array<{ __typename: 'ButtonRecord', id: any, text: string, url: string } | { __typename: 'FormRecord', id: any, subject?: string | null, reciever?: string | null, confirmation: string, formFields: Array<{ __typename: 'FormTextRecord', id: any, title?: string | null } | { __typename: 'FormTextblockRecord', id: any, title?: string | null } | { __typename: 'PdfFormRecord', id: any, title?: string | null }> } | { __typename: 'ImageRecord', id: any, image: Array<{ __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }> } | { __typename: 'VideoRecord', id: any, title?: string | null, video?: { __typename?: 'VideoField', height: any, width: any, title: string, provider: string, providerUid: string, thumbnailUrl: string, url: string } | null }> }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> } | null }> } | null, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> }> };

type AllProjectsQueryVariables = Exact<{ [key: string]: never; }>;


type AllProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename: 'ProjectRecord', _modelApiKey: string, title: string, url: string, text: string, image: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null }, region?: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } | null, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> }> };

type ProjectsIntroQueryVariables = Exact<{ [key: string]: never; }>;


type ProjectsIntroQuery = { __typename?: 'Query', introInitiative?: { __typename?: 'IntroInitiativeRecord', intro: string } | null };

type LatestProjectsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
}>;


type LatestProjectsQuery = { __typename?: 'Query', projects: Array<{ __typename: 'ProjectRecord', _modelApiKey: string, title: string, url: string, text: string, image: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, base64?: string | null, bgColor?: string | null, sizes: string } | null }, region?: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } | null, _seoMetaTags: Array<{ __typename?: 'Tag', attributes?: any | null, content?: string | null, tag: string }> }> };

type RegionQueryVariables = Exact<{
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type RegionQuery = { __typename?: 'Query', region?: { __typename: 'RegionRecord', id: any, name: string, slug: string, contactIntro?: string | null, info: Array<{ __typename?: 'MetaBlockRecord', text: string, title: string }>, gallery: Array<{ __typename?: 'SlideRecord', id: any, headline?: string | null, blackText?: any | null, image: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null }, link?: { __typename: 'AboutRecord', id: any, title: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null } | { __typename: 'CommissionRecord', id: any, title: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null } | { __typename: 'ForArtistRecord', id: any, title: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null } | { __typename: 'MemberNewsRecord', id: any, title: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null } | { __typename: 'NewsRecord', id: any, title: string, slug: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } | null } | null }>, sections: Array<{ __typename?: 'ImageShortcutRecord', id: any, headline?: string | null, text?: string | null, blackHeadline?: any | null, link?: string | null, image: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null, sizes: string } | null } } | { __typename?: 'LatestMemberNewsRecord', id: any } | { __typename?: 'LatestNewsRecord', id: any, description?: string | null } | { __typename?: 'SelectedCommissionRecord', commissions: Array<{ __typename: 'CommissionRecord', _modelApiKey: string, id: any, title: string, slug: string, city: string, year: string, artist: string, consultant: string, blackHeadline?: any | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null, category: { __typename?: 'CommissionCategoryRecord', id: any, title: string }, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null } }> } | { __typename?: 'SelectedMemberRecord', selectedMembers: Array<{ __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, slug: string, _status: ItemStatus, _firstPublishedAt: any, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }> } | { __typename?: 'TextRecord', id: any, url?: string | null, headline?: string | null, text?: string | null }> } | null };

type RegionMetaQueryVariables = Exact<{
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type RegionMetaQuery = { __typename?: 'Query', region?: { __typename?: 'RegionRecord', contactIntro?: string | null, info: Array<{ __typename?: 'MetaBlockRecord', title: string, text: string }> } | null, employees: Array<{ __typename?: 'EmployeeRecord', name: string, email: string, title?: string | null, region: { __typename?: 'RegionRecord', position?: any | null, contactIntro?: string | null, id: any, name: string, slug: string, global?: any | null, info: Array<{ __typename?: 'MetaBlockRecord', title: string, text: string }> } }>, boardmembers: Array<{ __typename?: 'BoardRecord', name: string, email: string, title?: string | null, region: { __typename?: 'RegionRecord', position?: any | null, id: any, name: string, slug: string, global?: any | null } }> };

type SiteSearchQueryVariables = Exact<{
  memberIds?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>> | InputMaybe<Scalars['ItemId']>>;
  newsIds?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>> | InputMaybe<Scalars['ItemId']>>;
  memberNewsIds?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>> | InputMaybe<Scalars['ItemId']>>;
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
}>;


type SiteSearchQuery = { __typename?: 'Query', members: Array<{ __typename: 'MemberRecord', _modelApiKey: string, slug: string, title: string, text?: string | null, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }>, news: Array<{ __typename: 'NewsRecord', _modelApiKey: string, title: string, slug: string, text: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }>, memberNews: Array<{ __typename: 'MemberNewsRecord', _modelApiKey: string, title: string, slug: string, text: string, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }> };

type SearchMembersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  memberCategoryIds?: InputMaybe<Array<InputMaybe<Scalars['ItemId']>> | InputMaybe<Scalars['ItemId']>>;
  regionId?: InputMaybe<Scalars['ItemId']>;
}>;


type SearchMembersQuery = { __typename?: 'Query', members: Array<{ __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, slug: string, _status: ItemStatus, _firstPublishedAt: any, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }>, pagination: { __typename?: 'CollectionMetadata', count: any } };

type SearchMembersFreeQueryVariables = Exact<{
  first?: InputMaybe<Scalars['IntType']>;
  skip?: InputMaybe<Scalars['IntType']>;
  query: Scalars['String'];
}>;


type SearchMembersFreeQuery = { __typename?: 'Query', members: Array<{ __typename: 'MemberRecord', _modelApiKey: string, id: any, firstName: string, lastName: string, fullName: string, email: string, slug: string, _status: ItemStatus, _firstPublishedAt: any, region: { __typename?: 'RegionRecord', id: any, name: string, slug: string, global?: any | null, position?: any | null }, image?: { __typename?: 'FileField', id: any, mimeType: string, url: string, title?: string | null, alt?: string | null, responsiveImage?: { __typename?: 'ResponsiveImage', src: string, width: any, height: any, alt?: string | null, title?: string | null, bgColor?: string | null } | null } | null }>, pagination: { __typename?: 'CollectionMetadata', count: any } };
