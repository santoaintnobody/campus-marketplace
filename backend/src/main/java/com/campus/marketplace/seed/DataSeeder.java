package com.campus.marketplace.seed;

import com.campus.marketplace.entity.*;
import com.campus.marketplace.entity.enums.*;
import com.campus.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final FavoriteRepository favoriteRepository;
    private final MessageRepository messageRepository;
    private final OfferRepository offerRepository;
    private final RatingRepository ratingRepository;
    private final NotificationRepository notificationRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled || userRepository.count() > 0) {
            return;
        }

        System.out.println("========================================");
        System.out.println("Seeding realistic Campus Marketplace data...");
        System.out.println("========================================");

        // 1. Create Admin
        User admin = createUser("Admin Officer", "admin@college.edu", "admin123", "ADM2026001",
                "Administration", "Staff", Role.ADMIN, 5.0, 0);

        // 2. Create 20+ Students
        User rahul = createUser("Rahul Sharma", "rahul@college.edu", "student123", "CS2021001",
                "Computer Science", "4th Year", Role.STUDENT, 4.9, 12);
        User priya = createUser("Priya Patel", "priya@college.edu", "student123", "EC2021002",
                "Electronics & Comm", "4th Year", Role.STUDENT, 4.8, 9);
        User arjun = createUser("Arjun Kumar", "arjun@college.edu", "student123", "ME2022001",
                "Mechanical", "3rd Year", Role.STUDENT, 4.7, 8);
        User sneha = createUser("Sneha Reddy", "sneha@college.edu", "student123", "CS2022002",
                "Computer Science", "3rd Year", Role.STUDENT, 5.0, 15);
        User vikram = createUser("Vikram Singh", "vikram@college.edu", "student123", "EE2021003",
                "Electrical", "4th Year", Role.STUDENT, 4.6, 7);
        User ananya = createUser("Ananya Iyer", "ananya@college.edu", "student123", "BT2023001",
                "Biotechnology", "2nd Year", Role.STUDENT, 4.8, 5);
        User rohan = createUser("Rohan Verma", "rohan@college.edu", "student123", "CV2022004",
                "Civil Engineering", "3rd Year", Role.STUDENT, 4.5, 4);
        User kavita = createUser("Kavita Nair", "kavita@college.edu", "student123", "IT2023002",
                "Information Tech", "2nd Year", Role.STUDENT, 4.9, 6);
        User aman = createUser("Aman Gupta", "aman@college.edu", "student123", "CS2024001",
                "Computer Science", "1st Year", Role.STUDENT, 0.0, 0);
        User deepa = createUser("Deepa Sundaram", "deepa@college.edu", "student123", "EC2022005",
                "Electronics & Comm", "3rd Year", Role.STUDENT, 4.7, 3);
        User karthik = createUser("Karthik Rao", "karthik@college.edu", "student123", "ME2021006",
                "Mechanical", "4th Year", Role.STUDENT, 4.8, 11);
        User pooja = createUser("Pooja Hegde", "pooja@college.edu", "student123", "MB2023001",
                "School of Management", "2nd Year", Role.STUDENT, 5.0, 4);
        User tanmay = createUser("Tanmay Joshi", "tanmay@college.edu", "student123", "CS2023007",
                "Computer Science", "2nd Year", Role.STUDENT, 4.6, 2);
        User shruti = createUser("Shruti Sen", "shruti@college.edu", "student123", "EE2023008",
                "Electrical", "2nd Year", Role.STUDENT, 4.8, 6);
        User aditya = createUser("Aditya Roy", "aditya@college.edu", "student123", "CV2021009",
                "Civil Engineering", "4th Year", Role.STUDENT, 4.7, 8);
        User meera = createUser("Meera Pillai", "meera@college.edu", "student123", "PH2024002",
                "Physics Dept", "1st Year", Role.STUDENT, 0.0, 0);
        User mohit = createUser("Mohit Chauhan", "mohit@college.edu", "student123", "ME2023010",
                "Mechanical", "2nd Year", Role.STUDENT, 4.5, 3);
        User divya = createUser("Divya Menon", "divya@college.edu", "student123", "IT2022011",
                "Information Tech", "3rd Year", Role.STUDENT, 4.9, 10);
        User suresh = createUser("Suresh Babu", "suresh@college.edu", "student123", "EC2024003",
                "Electronics & Comm", "1st Year", Role.STUDENT, 0.0, 0);
        User neha = createUser("Neha Kapoor", "neha@college.edu", "student123", "BT2022012",
                "Biotechnology", "3rd Year", Role.STUDENT, 4.8, 5);

        // 3. Create 30+ Realistic Listings
        Listing l1 = createListing(rahul, "Engineering Mathematics Higher Vol 1 & 2 - B.S. Grewal",
                "Standard engineering mathematics reference book in mint condition. Complete solutions and solved exercises. No pen marks or highlights.",
                Category.TEXTBOOKS, new BigDecimal("450"), ListingCondition.LIKE_NEW, "Central Library Gate");

        Listing l2 = createListing(priya, "Casio FX-991EX ClassWiz Scientific Calculator",
                "High-speed scientific calculator with 552 functions and natural textbook display. Matrix and vector calculations supported. Battery 100% full.",
                Category.CALCULATORS, new BigDecimal("950"), ListingCondition.LIKE_NEW, "Main Academic Block");

        Listing l3 = createListing(arjun, "Dell Inspiron 15 (Core i5, 16GB RAM, 512GB NVMe SSD)",
                "Full working laptop ideal for CAD, MATLAB, and coding projects. Fresh Windows 11 installation. Includes original 65W charger and protective sleeve.",
                Category.ELECTRONICS, new BigDecimal("26500"), ListingCondition.GOOD, "Hostel Block A - Room 204");

        Listing l4 = createListing(sneha, "Hero Sprint 26T 21-Speed Gear Bicycle",
                "Smooth commute bicycle with Shimano gears and front disc brake. Brand new mudguards and cable lock with 2 keys included.",
                Category.BICYCLES, new BigDecimal("3800"), ListingCondition.GOOD, "Hostel Cycle Stand");

        Listing l5 = createListing(vikram, "Solid Wooden Study Table with 3 Storage Drawers",
                "Comfortable ergonomic height study desk with laminate finish. Fits 24-inch monitor, laptop, and books easily. Moving out sale.",
                Category.FURNITURE, new BigDecimal("1400"), ListingCondition.GOOD, "Hostel Block B");

        Listing l6 = createListing(ananya, "Biochemistry & Molecular Biology Lab Record & Manual",
                "Clean, certified lab record with complete diagrams, observations, and viva questions. Verified by department faculty.",
                Category.LAB_RECORDS, new BigDecimal("180"), ListingCondition.LIKE_NEW, "Biotech Dept Ground Floor");

        Listing l7 = createListing(kavita, "Rechargeable Eye-Care LED Study Lamp",
                "3 color modes (Warm/Natural/Cool) with step-less touch dimming. Built-in 2000mAh battery with USB Type-C charging port.",
                Category.HOSTEL_ESSENTIALS, new BigDecimal("550"), ListingCondition.LIKE_NEW, "Girls Hostel 2");

        Listing l8 = createListing(rohan, "Arduino Uno R3 Starter Kit with 30+ Sensors & Breadboard",
                "Complete electronics starter kit for IoT and robotics projects. Ultrasonic sensor, servos, relay, LCD display, and jumper wires included.",
                Category.ELECTRONICS, new BigDecimal("1100"), ListingCondition.LIKE_NEW, "Robotics Lab");

        Listing l9 = createListing(karthik, "Ergonomic High-Back Mesh Office Chair with Lumbar Support",
                "Adjustable height, tilt lock, smooth rolling nylon casters. Breathable mesh back perfect for long study hours.",
                Category.FURNITURE, new BigDecimal("2200"), ListingCondition.GOOD, "Hostel Block C");

        Listing l10 = createListing(deepa, "Texas Instruments TI-84 Plus CE Color Graphing Calculator",
                "Color display graphing calculator with pre-installed apps. Essential for advanced calculus, statistics, and engineering curves.",
                Category.CALCULATORS, new BigDecimal("3900"), ListingCondition.LIKE_NEW, "Math Dept Lobby");

        Listing l11 = createListing(tanmay, "Introduction to Algorithms (CLRS 3rd Edition)",
                "The bible of algorithms! Cormen, Leiserson, Rivest, Stein. Essential for DSA placements and semester exams. Crisp pages.",
                Category.TEXTBOOKS, new BigDecimal("550"), ListingCondition.GOOD, "Cafeteria Terrace");

        Listing l12 = createListing(shruti, "Mini Single-Door Refrigerator 45L (Haier)",
                "Compact, energy-efficient personal fridge. Quick chill freezer compartment. Perfect for hostel summers. 1.5 years old, pristine.",
                Category.HOSTEL_ESSENTIALS, new BigDecimal("5200"), ListingCondition.GOOD, "Hostel Block D");

        Listing l13 = createListing(aditya, "Engineering Graphics Drawing Board (Imperial Size) + Mini Drafter",
                "Complete first-year engineering drawing kit. Precision mini drafter with steel clamps, set squares, and waterproof board bag.",
                Category.OTHER, new BigDecimal("750"), ListingCondition.LIKE_NEW, "Civil Drawing Hall");

        Listing l14 = createListing(divya, "Mechanical Gaming Keyboard with RGB & Blue Switches",
                "Tactile mechanical switches, detachable braided Type-C cable, anti-ghosting keys. Great typing experience for coding.",
                Category.ELECTRONICS, new BigDecimal("1450"), ListingCondition.GOOD, "Computer Center");

        Listing l15 = createListing(mohit, "Firefox Cyclone 27.5T Mountain Bike with Front Suspension",
                "Premium alloy frame MTB with double-wall alloy rims and dual disc brakes. Super smooth riding across campus terrains.",
                Category.BICYCLES, new BigDecimal("7900"), ListingCondition.GOOD, "Main Sports Complex");

        Listing l16 = createListing(pooja, "Kotler's Marketing Management 16th Edition",
                "Global standard MBA & management marketing textbook. Clean highlighter annotations on key case studies. Excellent condition.",
                Category.TEXTBOOKS, new BigDecimal("600"), ListingCondition.LIKE_NEW, "Management Block");

        Listing l17 = createListing(rahul, "JBL Flip 5 Portable Waterproof Bluetooth Speaker",
                "Authentic JBL Bluetooth speaker with 12 hours playtime and powerful bass. Comes with original charging cable.",
                Category.ELECTRONICS, new BigDecimal("3400"), ListingCondition.GOOD, "Hostel Block A");

        Listing l18 = createListing(priya, "Foldable Laptop Table with Cup Holder & Tablet Slot",
                "Portable bed study desk with non-slip legs and ergonomic curved edge. Lightweight and easy to fold.",
                Category.FURNITURE, new BigDecimal("450"), ListingCondition.LIKE_NEW, "Girls Hostel 1");

        Listing l19 = createListing(arjun, "Data Structures and OOP in Java - Complete Lab Manual",
                "All lab assignments with complete Java code, dry runs, and output screenshots. Well formatted.",
                Category.LAB_RECORDS, new BigDecimal("140"), ListingCondition.LIKE_NEW, "CS Lab 3");

        Listing l20 = createListing(sneha, "Aluminum Height-Adjustable Ergonomic Laptop Stand",
                "Heavy-duty aluminum alloy stand supporting up to 17-inch laptops. Heat dissipation design with silicone anti-slip pads.",
                Category.ELECTRONICS, new BigDecimal("650"), ListingCondition.LIKE_NEW, "Hostel Block B");

        Listing l21 = createListing(vikram, "Single Bed Coir & Foam Hostel Mattress (3x6 ft)",
                "Comfortable 4-inch orthopedic coir and high-density foam mattress with washable cotton cover. Clean and hygienic.",
                Category.HOSTEL_ESSENTIALS, new BigDecimal("950"), ListingCondition.GOOD, "Hostel Block B");

        Listing l22 = createListing(ananya, "LG 24-inch Full HD IPS Borderless Monitor (75Hz, HDMI)",
                "Crisp 1080p IPS monitor with AMD FreeSync and reader mode. Includes HDMI cable and power adapter. 0 dead pixels.",
                Category.ELECTRONICS, new BigDecimal("6200"), ListingCondition.LIKE_NEW, "Biotech Staff Quarters");

        Listing l23 = createListing(kavita, "Wildcraft 45L College Backpack with Rain Cover & Laptop Sleeve",
                "Durable multi-compartment water-resistant backpack with padded shoulder straps and dedicated 15.6-inch laptop pocket.",
                Category.OTHER, new BigDecimal("850"), ListingCondition.LIKE_NEW, "Main Gate Bus Stop");

        Listing l24 = createListing(rohan, "Clean Code & Design Patterns (Gang of Four) Book Combo",
                "Two must-read software engineering books: Robert C. Martin's Clean Code and GoF Design Patterns. Essential for placements.",
                Category.TEXTBOOKS, new BigDecimal("700"), ListingCondition.LIKE_NEW, "Library Reading Room");

        Listing l25 = createListing(deepa, "Anker 7-in-1 USB-C Hub (4K HDMI, 100W PD, SD Card, USB 3.0)",
                "Premium aluminum USB Type-C multiport adapter compatible with MacBook, Dell, HP, and iPads.",
                Category.ELECTRONICS, new BigDecimal("1250"), ListingCondition.LIKE_NEW, "Electronics Dept");

        Listing l26 = createListing(karthik, "Milton Insulated Stainless Steel 1000ml Hot & Cold Flask",
                "Double walled vacuum insulated thermo steel water bottle. Keeps liquids cold/hot for 24 hours.",
                Category.HOSTEL_ESSENTIALS, new BigDecimal("400"), ListingCondition.LIKE_NEW, "Mech Canteen");

        Listing l27 = createListing(tanmay, "Logitech M331 Silent Wireless Mouse",
                "Quiet clicking wireless mouse with 24-month battery life and precise optical tracking. Nano receiver included.",
                Category.ELECTRONICS, new BigDecimal("600"), ListingCondition.LIKE_NEW, "Central Computing Facility");

        Listing l28 = createListing(shruti, "Electronic Circuits Analysis & Design - Sedra & Smith (8th Edition)",
                "Microelectronic Circuits textbook with circuit analysis problems and SPICE simulation guides.",
                Category.TEXTBOOKS, new BigDecimal("500"), ListingCondition.GOOD, "Electrical Lab");

        Listing l29 = createListing(aditya, "Stainless Steel Electric Kettle 1.5L (Pigeon)",
                "Automatic shut-off electric kettle with 360-degree swivel base. Ideal for quick noodles, tea, and warm water in hostel.",
                Category.HOSTEL_ESSENTIALS, new BigDecimal("500"), ListingCondition.GOOD, "Hostel Block C");

        Listing l30 = createListing(mohit, "Hercules Roadeo 26T Hardtail Cycle with Disc Brakes",
                "Sporty red and black campus bicycle with wide puncture-resistant tires. Free helmet and combination lock.",
                Category.BICYCLES, new BigDecimal("4200"), ListingCondition.GOOD, "Cycle Shed 2");

        // 4. Create Favorites
        createFavorite(rahul, l2);
        createFavorite(rahul, l4);
        createFavorite(rahul, l8);
        createFavorite(priya, l1);
        createFavorite(priya, l5);
        createFavorite(arjun, l2);
        createFavorite(sneha, l3);
        createFavorite(sneha, l10);
        createFavorite(ananya, l14);
        createFavorite(kavita, l1);
        createFavorite(vikram, l15);
        createFavorite(divya, l17);

        // 5. Create Offers
        createOffer(rahul, priya, l2, new BigDecimal("800"), "Can you do ₹800? I can pick it up from the Main Gate today.", OfferStatus.ACCEPTED, null);
        createOffer(arjun, sneha, l4, new BigDecimal("3200"), "Will take it for ₹3,200 immediately if gears are smooth.", OfferStatus.COUNTERED, new BigDecimal("3500"));
        createOffer(ananya, rahul, l1, new BigDecimal("400"), "Hi Rahul, can collect this evening at library for ₹400.", OfferStatus.PENDING, null);
        createOffer(karthik, arjun, l3, new BigDecimal("24000"), "Is ₹24,000 okay for the Dell laptop?", OfferStatus.REJECTED, null);
        createOffer(divya, priya, l18, new BigDecimal("400"), "Can you bring it near Girls Hostel 1?", OfferStatus.ACCEPTED, null);
        createOffer(tanmay, rohan, l8, new BigDecimal("950"), "Offering ₹950 for the Arduino kit.", OfferStatus.PENDING, null);

        // 6. Create Messages / Chat Conversations
        createMessage(rahul, priya, l2, "Hi Priya, is the Casio calculator still available?", LocalDateTime.now().minusDays(3));
        createMessage(priya, rahul, l2, "Yes Rahul! It's in brand new condition with original casing.", LocalDateTime.now().minusDays(3).plusMinutes(10));
        createMessage(rahul, priya, l2, "Awesome, would you accept ₹800? I can collect it from the Main Academic Block.", LocalDateTime.now().minusDays(3).plusMinutes(25));
        createMessage(priya, rahul, l2, "Deal! Let's meet tomorrow near the library around 4 PM.", LocalDateTime.now().minusDays(3).plusMinutes(30));

        createMessage(arjun, sneha, l4, "Hello Sneha, are the tires on the Hero Sprint newly fitted?", LocalDateTime.now().minusDays(2));
        createMessage(sneha, arjun, l4, "Yes Arjun, changed both inner tubes and tires last month at campus workshop.", LocalDateTime.now().minusDays(2).plusMinutes(15));
        createMessage(arjun, sneha, l4, "Sounds great. I made an offer on the app, let me know if ₹3,500 counter works for you.", LocalDateTime.now().minusDays(2).plusMinutes(20));

        createMessage(ananya, rahul, l1, "Hey Rahul! Is the Grewal maths book still for sale?", LocalDateTime.now().minusHours(12));
        createMessage(rahul, ananya, l1, "Yes Ananya, both volume 1 & 2 are available together.", LocalDateTime.now().minusHours(11));

        // 7. Completed Transactions & Ratings/Reviews
        Transaction t1 = createTransaction(l2, rahul, priya, new BigDecimal("800"), TransactionStatus.COMPLETED);
        createRating(rahul, priya, l2, 5, "Priya was very polite and punctual. The calculator was in perfect working order! Highly recommended seller.");

        Transaction t2 = createTransaction(l18, divya, priya, new BigDecimal("400"), TransactionStatus.COMPLETED);
        createRating(divya, priya, l18, 5, "Great study table, super lightweight and clean as described. Smooth meetup at GH1.");

        Transaction t3 = createTransaction(l5, arjun, vikram, new BigDecimal("1300"), TransactionStatus.COMPLETED);
        createRating(arjun, vikram, l5, 5, "Very sturdy table. Vikram even helped me carry it down the hostel stairs. 5/5 stars!");

        // 8. Notifications
        createNotification(priya, NotificationType.OFFER_RECEIVED, "New Offer Received", "Rahul Sharma made an offer of ₹800 for 'Casio FX-991EX'", l2.getId());
        createNotification(rahul, NotificationType.OFFER_ACCEPTED, "Offer Accepted! 🎉", "Your offer of ₹800 for 'Casio FX-991EX' was accepted!", l2.getId());
        createNotification(priya, NotificationType.RATING_RECEIVED, "New 5-Star Rating", "Rahul Sharma gave you a 5-star review: 'Priya was very polite...'", l2.getId());
        createNotification(sneha, NotificationType.OFFER_RECEIVED, "New Offer Received", "Arjun Kumar made an offer of ₹3,200 for 'Hero Sprint Bicycle'", l4.getId());
        createNotification(rahul, NotificationType.MESSAGE, "New Message", "Ananya Iyer: Hey Rahul! Is the Grewal maths book still for sale?", l1.getId());
        createNotification(vikram, NotificationType.RATING_RECEIVED, "New 5-Star Rating", "Arjun Kumar left a 5-star review for 'Solid Wooden Study Table'", l5.getId());

        System.out.println("========================================");
        System.out.println("✅ Realistic sample data created successfully!");
        System.out.println("Admin: admin@college.edu / admin123");
        System.out.println("Students: rahul@college.edu, priya@college.edu, arjun@college.edu, sneha@college.edu / student123");
        System.out.println("========================================");
    }

    private User createUser(String name, String email, String password, String studentId,
                           String department, String year, Role role, Double rating, Integer ratingCount) {
        User user = User.builder()
                .fullName(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .studentId(studentId)
                .department(department)
                .year(year)
                .role(role)
                .emailVerified(true)
                .accountActive(true)
                .rating(rating)
                .ratingCount(ratingCount)
                .build();
        return userRepository.save(user);
    }

    private Listing createListing(User seller, String title, String description,
                                  Category category, BigDecimal price, ListingCondition condition,
                                  String location) {
        Listing listing = Listing.builder()
                .seller(seller)
                .title(title)
                .description(description)
                .category(category)
                .price(price)
                .itemCondition(condition)
                .status(ListingStatus.ACTIVE)
                .location(location)
                .images(new ArrayList<>())
                .build();
        return listingRepository.save(listing);
    }

    private void createFavorite(User user, Listing listing) {
        Favorite favorite = Favorite.builder()
                .user(user)
                .listing(listing)
                .build();
        favoriteRepository.save(favorite);
    }

    private void createOffer(User buyer, User seller, Listing listing, BigDecimal amount, String message, OfferStatus status, BigDecimal counterAmount) {
        Offer offer = Offer.builder()
                .buyer(buyer)
                .seller(seller)
                .listing(listing)
                .offerAmount(amount)
                .counterAmount(counterAmount)
                .message(message)
                .status(status)
                .build();
        offerRepository.save(offer);
    }

    private void createMessage(User sender, User recipient, Listing listing, String content, LocalDateTime time) {
        Message message = Message.builder()
                .sender(sender)
                .receiver(recipient)
                .listing(listing)
                .content(content)
                .isRead(true)
                .timestamp(time)
                .build();
        messageRepository.save(message);
    }

    private Transaction createTransaction(Listing listing, User buyer, User seller, BigDecimal amount, TransactionStatus status) {
        Transaction tx = Transaction.builder()
                .listing(listing)
                .buyer(buyer)
                .seller(seller)
                .amount(amount)
                .status(status)
                .build();
        return transactionRepository.save(tx);
    }

    private void createRating(User reviewer, User reviewedUser, Listing listing, int rating, String review) {
        Rating r = Rating.builder()
                .reviewer(reviewer)
                .reviewedUser(reviewedUser)
                .listing(listing)
                .rating(rating)
                .review(review)
                .build();
        ratingRepository.save(r);
    }

    private void createNotification(User user, NotificationType type, String title, String message, Long referenceId) {
        Notification notif = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .build();
        notificationRepository.save(notif);
    }
}
