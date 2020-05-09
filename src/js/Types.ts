export interface SectionType {
    file: File;
    uploaded: boolean;
    publicUrl?: string;
    link?: string;
}

export interface EDMDataType {
    edm_id: string;
    preheader: string;
    sections: Array<{
        link: string;
        alt: string;
        public_url: string;
    }>;
}
