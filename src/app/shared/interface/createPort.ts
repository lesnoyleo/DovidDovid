export interface createPortBody {
  country_code: string | undefined;
  state: string;
  city: string;
  asn: number;
  type_id: number;
  proxy_type_id: number | null;
  name: string | null;
  server_port_type_id: number;
}
