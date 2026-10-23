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
import iphone18_1 from '../assets/iphone18(1).webp'
import iphone18_2 from '../assets/iphone18(2).webp'
import iphone17_1 from '../assets/iphone17(1).webp'
import iphone17_2 from '../assets/iphone17(2).webp'
import iphone17_3 from '../assets/iphone17(3).webp'
import airpods4_1 from '../assets/Airpods4_1.webp'
import airpods4_2 from '../assets/Airpods4_2.webp'
import airpods4_3 from '../assets/Airpods4_3.webp'
import LGwashingmachine_1 from '../assets/LGwashingmachine_1.webp'
import LGwashingmachine_2 from '../assets/LGwashingmachine_2.webp'
import LGwashingmachine_3 from '../assets/LGwashingmachine_3.webp'
import SamsungVacuumCleaner_1 from '../assets/SamsungVacuumCleaner_1.webp'
import SamsungVacuumCleaner_2 from '../assets/SamsungVacuumCleaner_2.webp'
import SamsungVacuumCleaner_3 from '../assets/SamsungVacuumCleaner_3.webp'
import Samsungtv1 from '../assets/Samsungtv1.webp'
import Samsungtv2 from '../assets/Samsungtv2.webp'
import Samsungtv3 from '../assets/Samsungtv3.webp'



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
    iphoneduoheroeng,
    iphone17_1,
    iphone17_2,
    iphone17_3,
    iphone18_1,
    iphone18_2
}

export const products = [
    {
        _id: "0",
        name: "Nutribullet Air Fryer",
        description: "This is the description for Product 1.",
        price: 99.99,
        image: [airfryer, airfryer2, airfryer3, airfryer4],
        category: "Small Kitchen Appliances",
        subCategory: "Air Fryers",
        date: "2023-06-01T12:00:00Z",
        bestSeller: false
    },
    {
        _id: "1",
        name: "ASUS VivoBook 15",
        description: "This is the description for Product 2.",
        price: 519.99,
        image: [AsusLaptop, AsusLaptop2, AsusLaptop3],
        category: "Computers & IT",
        subCategory: "Laptops",
        date: "2023-06-01T12:00:00Z",
        bestSeller: false
    },
    {
        _id: "2",
        name: "LENOVO IdeaPad Slim 3",
        description: "This is a description for product 3",
        price: 499.99,
        image: [LenovoLaptop1, LenovoLaptop2, LenovoLaptop3],
        category: "Computers & IT",
        subCategory: "Laptops",
        date: "2023-06-01T12:00:00Z",
        bestSeller: true
    },
    {
        _id: "3",
        name: "TEFAL GV 9821 E0",
        description: "This is a description for product 3",
        price: 499.99,
        image: [TefalIron],
        category: "Home Comfort & Cleaning",
        subCategory: "Irons",
        date: "2023-06-01T12:00:00Z",
        bestSeller: true
    },
        {
        _id: "4",
        name: "iPhone 18",
        description: "Apple iPhone 18 smartphone.",
        price: 999.99,
        image: [iphone18_1, iphone18_2],
        category: "Smartphones & Gadgets",
        subCategory: "Smartphones",
        date: "2026-10-23T12:00:00Z",
        bestSeller: true
    },
    {
        _id: "5",
        name: "iPhone 17",
        description: "Apple iPhone 17 smartphone.",
        price: 899.99,
        image: [iphone17_1, iphone17_2, iphone17_3],
        category: "Smartphones & Gadgets",
        subCategory: "Smartphones",
        date: "2026-10-23T12:00:00Z",
        bestSeller: true
    },
    {
        _id: "6",
        name: "AirPods 4",
        description: "Apple AirPods 4 wireless earbuds.",
        price: 129.99,
        image: [airpods4_1, airpods4_2, airpods4_3],
        category: "Smartphones & Gadgets",
        subCategory: "Headphones",
        date: "2026-10-23T12:00:00Z",
        bestSeller: false
    },
    {
        _id: "7",
        name: "LG Washing Machine",
        description: "LG washing machine.",
        price: 699.99,
        image: [LGwashingmachine_1, LGwashingmachine_2, LGwashingmachine_3],
        category: "Home Comfort & Cleaning",
        subCategory: "Washing Machines",
        date: "2026-10-23T12:00:00Z",
        bestSeller: false
    },
    {
        _id: "8",
        name: "Samsung Vacuum Cleaner",
        description: "Samsung vacuum cleaner.",
        price: 399.99,
        image: [SamsungVacuumCleaner_1, SamsungVacuumCleaner_2, SamsungVacuumCleaner_3],
        category: "Home Comfort & Cleaning",
        subCategory: "Vacuum Cleaners",
        date: "2026-10-23T12:00:00Z",
        bestSeller: true
    },
    {
        _id: "9",
        name: "Samsung TV",
        description: "Samsung TV.",
        price: 399.99,
        image: [Samsungtv1, Samsungtv2, Samsungtv3],
        category: "Electronics",
        subCategory: "TVs",
        date: "2026-10-23T12:00:00Z",
        bestSeller: true
    }
]