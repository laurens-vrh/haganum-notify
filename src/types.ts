export interface MagisterUser {
	UuId: string;
	Persoon: {
		Studie: string;
		Klas: string;
		StamNr: number;
		ExamenNr: number;
		Profielen: string;
		Id: number;
		Roepnaam: string;
		Tussenvoegsel?: string;
		Achternaam: string;
		OfficieleVoornamen: string;
		Voorletters: string;
		OfficieleTussenvoegsels?: string;
		OfficieleAchternaam: string;
		Geboortedatum: string;
		GeboorteAchternaam?: string;
		GeboortenaamTussenvoegsel?: string;
		GebruikGeboortenaam: boolean;
	};
	Groep: Array<{
		Naam: string;
		Privileges: Array<string>;
		Links?: Array<string>;
	}>;
	Links: Array<string>;
}

export interface MagisterGrades {
	items?: Array<{
		kolomId: number;
		omschrijving: string;
		ingevoerdOp: string;
		vak: {
			code: string;
			omschrijving: string;
		};
		waarde: string;
		weegfactor: number;
		isVoldoende: boolean;
		teltMee: boolean;
		moetInhalen: boolean;
		heeftVrijstelling: boolean;
		behaaldOp?: string;
		links: {};
	}>;
	links?: {
		voortgangscijfers: { href: string };
		first: { href: string };
		next: { href: string };
		last: { href: string };
	};
	totalCount?: number;
}
