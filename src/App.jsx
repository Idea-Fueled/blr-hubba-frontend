import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Events } from "./pages/Events";
import EventDetailPage from "./pages/EventDetail/EventDetailPage";
import { BookingPage } from "./pages/BookingFlowPage/BookingPage";
import { ReviewOrder } from "./components/BookingPage/ReviewOrder";
import { CartConfirmation } from "./components/BookingPage/CartConfirmation";
import { Cart } from "./components/BookingPage/Cart";
import { BookingConfirmation } from "./components/BookingPage/BookingConfirmation";
import { CancelBooking } from "./components/BookingPage/CancelBooking";
import LoginModal from "./components/LoginModal/LoginModal";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import BookingsPage from "./pages/Bookings/BookingsPage";
import FavouritesPage from "./pages/Favourites/FavouritesPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import HelpPage from "./pages/Help/HelpPage";
import { Toaster } from "sonner";
import { LanguageProvider } from "./context/LanguageContext";
import Homepage from "./pages/Home/Homepage";
import { VenuesPage } from "./pages/Venues/VenuesPage";
import { VenueDetailPage } from "./pages/VenueDetail/VenueDetailPage";
import RegisterPage from "./pages/Register/RegisterPage";
import FestivalsPage from "./pages/Festivals/FestivalsPage";
import SubfestivalDetailPage from "./pages/Festivals/SubfestivalDetailPage";
import ContactUsPage from "./pages/ContactUs/ContactUsPage";
import AboutUsPage from "./pages/AboutUs/AboutUsPage";
import ArchivesPage from "./pages/Archives/ArchivesPage";
import FaqPage from "./pages/Faq/FaqPage";
import OurTeamPage from "./pages/OurTeam/OurTeamPage";
import NewsAndMediaPage from "./pages/NewsAndMedia/NewsAndMediaPage";
import SponsorsPage from "./pages/Sponsors/SponsorsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfService/TermsOfServicePage";

const App = () => {

  const router = createBrowserRouter([{
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Homepage />
      },
      {
        path: "/festivals",
        element: <FestivalsPage />
      },
      {
        path: "/festivals/:subfestivalSlug",
        element: <SubfestivalDetailPage />
      },
      {
        path: "/contact-us",
        element: <ContactUsPage />
      },
      {
        path: "/about-us",
        element: <AboutUsPage />
      },
      {
        path: "/about",
        element: <AboutUsPage />
      },
      {
        path: "/sponsors",
        element: <SponsorsPage />
      },
      {
        path: "/our-sponsors",
        element: <SponsorsPage />
      },
      {
        path: "/archives",
        element: <ArchivesPage />
      },
      {
        path: "/archive",
        element: <ArchivesPage />
      },
      {
        path: "/faqs",
        element: <FaqPage />
      },
      {
        path: "/faq",
        element: <FaqPage />
      },
      {
        path: "/our-team",
        element: <OurTeamPage />
      },
      {
        path: "/team",
        element: <OurTeamPage />
      },
      {
        path: "/teams",
        element: <OurTeamPage />
      },
      {
        path: "/news-and-media",
        element: <NewsAndMediaPage />
      },
      {
        path: "/news-media",
        element: <NewsAndMediaPage />
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicyPage />
      },
      {
        path: "/privacy",
        element: <PrivacyPolicyPage />
      },
      {
        path: "/terms-of-service",
        element: <TermsOfServicePage />
      },
      {
        path: "/terms-and-conditions",
        element: <TermsOfServicePage />
      },
      {
        path: "/terms",
        element: <TermsOfServicePage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },
      {
        path: "/events",
        element: <Events />
      },
      {
        path: "/venues",
        element: <VenuesPage />
      },
      {
        path: "/venues/:venueSlug",
        element: <VenueDetailPage />
      },
      {
        path: "/events/:eventId",
        element: <EventDetailPage />
      },
      {
        path: "/book",
        element: <BookingPage />
      },
      {
        path: "/review-order",
        element: <ReviewOrder />
      },
      {
        path: "/cart-confirmation",
        element: <CartConfirmation />
      },
      {
        path: "/cart",
        element: <Cart />
      },
      {
        path: "/booking-confirmation",
        element: <BookingConfirmation />
      },
      {
        path: "/cancel-booking",
        element: <CancelBooking />
      },
      {
        path: "/dashboard",
        element: <DashboardPage />
      },
      {
        path: "/bookings",
        element: <BookingsPage />
      },
      {
        path: "/favorites",
        element: <FavouritesPage />
      },
      {
        path: "/profile",
        element: <ProfilePage />
      },
      {
        path: "/help",
        element: <HelpPage />
      },
      {
        path: "/login",
        element: <LoginModal />
      }
    ]
  }], {
    basename: "/"
  });

  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </LanguageProvider>
  );
};

export default App;