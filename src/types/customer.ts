/**
 * @fileoverview Customer entity types, API responses, and form contracts.
 */

/**
 * HATEOAS hyperlinks for a customer resource.
 */
export interface CustomerLinks {
  /** Canonical self link to the customer */
  self: {
    href: string;
  };
  /** Link to customer entity resource */
  customer: {
    href: string;
  };
  /** Link to customer's training sessions */
  trainings: {
    href: string;
  };
}

/**
 * Customer domain entity returned from REST endpoints.
 */
export interface Customer {
  /** First name of the customer */
  firstname: string;
  /** Last name of the customer */
  lastname: string;
  /** Primary contact email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Street address */
  streetaddress: string;
  /** Postal code / zip code */
  postcode: string;
  /** City name */
  city: string;
  /** HATEOAS navigational links */
  _links: CustomerLinks;
}

/**
 * Payload contract for creating or updating a customer record.
 */
export interface CustomerFormData {
  /** First name */
  firstname: string;
  /** Last name */
  lastname: string;
  /** Email address */
  email: string;
  /** Contact phone number */
  phone: string;
  /** Street address */
  streetaddress: string;
  /** Postal code */
  postcode: string;
  /** City */
  city: string;
}

/**
 * HATEOAS wrapper response for customer collection list queries.
 */
export interface CustomerListResponse {
  _embedded: {
    customers: Customer[];
  };
}

/**
 * Embedded customer summary object returned inside /gettrainings endpoint.
 */
export interface CustomerSummary {
  /** Numeric ID of the customer */
  id: number;
  /** First name */
  firstname: string;
  /** Last name */
  lastname: string;
  /** Street address */
  streetaddress: string;
  /** Postal code */
  postcode: string;
  /** City */
  city: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
}

