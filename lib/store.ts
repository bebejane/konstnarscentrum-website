import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

export interface StoreState {
	region: Region | undefined;
	showMenu: boolean;
	showSubMenu: boolean;
	showMenuMobile: boolean;
	showSearch: boolean;
	images: FileField[];
	imageId: string;
	darkMode: boolean;
	invertedMenu: boolean;
	setShowMenu: (showMenu: boolean) => void;
	setShowSubMenu: (showSubMenu: boolean) => void;
	setShowMenuMobile: (showMenuMobile: boolean) => void;
	setInvertedMenu: (invetedMenu: boolean) => void;
	setRegion: (region: Region | undefined) => void;
	setImages: (images: FileField[] | undefined) => void;
	setImageId: (imageId: string | undefined) => void;
	setShowSearch: (showSearch: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
	showMenu: true,
	showSubMenu: false,
	showMenuMobile: false,
	showSearch: false,
	region: undefined,
	images: [],
	imageId: undefined,
	darkMode: false,
	invertedMenu: false,
	setShowMenu: (showMenu: boolean) =>
		set((state) => ({
			showMenu,
		})),
	setShowSubMenu: (showSubMenu: boolean) =>
		set((state) => ({
			showSubMenu,
		})),
	setShowMenuMobile: (showMenuMobile: boolean) =>
		set((state) => ({
			showMenuMobile,
		})),
	setRegion: (region: Region | undefined) =>
		set((state) => ({
			region,
		})),
	setImageId: (imageId: string | undefined) =>
		set((state) => ({
			imageId,
		})),
	setImages: (images: FileField[] | undefined) =>
		set((state) => ({
			images,
		})),
	setDarkMode: (darkMode: boolean) =>
		set((state) => ({
			darkMode,
		})),
	setInvertedMenu: (invertedMenu: boolean) =>
		set((state) => ({
			invertedMenu,
		})),
	setShowSearch: (showSearch: boolean) =>
		set((state) => ({
			showSearch,
		})),
}));

export default useStore;
export { shallow, useStore };
