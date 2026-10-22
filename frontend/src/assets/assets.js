import nexoraLogo from '../assets/NexoraLogo.png';
import carticon from '../assets/carticon.png';
import usericon from '../assets/usericon.png';
import searchicon from '../assets/searchicon.png';
import menuicon from '../assets/menuicon.png';
import dropdownicon from '../assets/dropdownicon.png';
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';
import favourite from '../assets/favouriteicon.png';
import cheapDealsCategory from '../assets/cheapdealscategory.webp';
import fridgesCategory from '../assets/fridgescategory.webp';
import headphonesCategory from '../assets/headphonescategory.webp';
import heaterCategory from '../assets/heatercategory.webp';
import iphone18CategoryImg from '../assets/iphone18categoryimg.webp';
import laptopsCategory from '../assets/laptopscategory.webp';
import promotionImg from '../assets/promotionimg.webp';
import smartphoneCategory from '../assets/smartphonecategory.webp';
import tvsCategory from '../assets/tvscategory.webp';
import vacuumCleanerCategory from '../assets/vacuumcleanercategory.webp';
import washingMachineCategory from '../assets/washingmashinecategory.webp';
import waterHeatersCategory from '../assets/waterheaterscategory.webp';
import airfryer from '../assets/airfryer.webp';
import airfryer2 from '../assets/airfryer2.webp';
import airfryer3 from '../assets/airfryer3.webp';
import airfryer4 from '../assets/airfryer4.webp';
import AsusLaptop from '../assets/AsusLaptop1.webp';
import AsusLaptop2 from '../assets/AsusLaptop2.webp';
import AsusLaptop3 from '../assets/AsusLaptop3.webp';
import LenovoLaptop1 from '../assets/LenovoLaptop1.webp';
import LenovoLaptop2 from '../assets/LenovoLaptop2.webp';
import LenovoLaptop3 from '../assets/LenovoLaptop3.webp';
import TefalIron from '../assets/TefalIron.webp'
import iphoneduoheroeng from '../assets/iphoneduoheroeng.png'

export const assets = {
    nexoraLogo,
    carticon,
    usericon,
    searchicon,
    menuicon,
    dropdownicon,
    slide1,
    slide2,
    slide3,
    favourite,
    cheapDealsCategory,
    fridgesCategory,
    headphonesCategory,
    heaterCategory,
    iphone18CategoryImg,
    laptopsCategory,
    promotionImg,
    smartphoneCategory,
    tvsCategory,
    vacuumCleanerCategory,
    washingMachineCategory,
    waterHeatersCategory,
    airfryer,
    airfryer2,
    airfryer3,
    airfryer4,
    AsusLaptop,
    AsusLaptop2,
    AsusLaptop3,
    LenovoLaptop1,
    LenovoLaptop2,
    LenovoLaptop3,
    TefalIron,
    iphoneduoheroeng
}

export const products = [
    {
        _id: "0",
        name: "Nutribullet Air Fryer",
        description: "This is the description for Product 1.",
        price: 99.99,
        image: [airfryer, airfryer2, airfryer3, airfryer4],
        category: "Cooking",
        subCategory: "Subcategory 1",
        date: "2023-06-01T12:00:00Z",
        bestSeller: false
    },
    {
        _id: "1",
        name: "ASUS VivoBook 15",
        description: "This is the description for Product 2.",
        price: 519.99,
        image: [AsusLaptop, AsusLaptop2, AsusLaptop3],
        category: "Laptop",
        subCategory: "Subcategory 1",
        date: "2023-06-01T12:00:00Z",
        bestSeller: true
    },
    {
        _id: "2",
        name: "LENOVO IdeaPad Slim 3",
        description: "This is a description for product 3",
        price: 499.99,
        image: [LenovoLaptop1, LenovoLaptop2, LenovoLaptop3],
        category: "Laptop",
        subCategory: "Subcategory 1",
        date: "2023-06-01T12:00:00Z",
        bestSeller: true
    },
    {
        _id: "3",
        name: "TEFAL GV 9821 E0",
        description: "This is a description for product 3",
        price: 499.99,
        image: [TefalIron],
        category: "Laptop",
        subCategory: "Subcategory 1",
        date: "2023-06-01T12:00:00Z",
        bestSeller: true
    }
]