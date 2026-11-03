import React from "react";
import "./TermsOfServicePage.css";

const TERMS_SECTIONS = [
    {
        id: "terms-and-conditions",
        title: "Terms & Conditions",
        paragraphs: [
            <>
                This ‘Terms and Conditions’ document (“T&C”) governs the end users’ (“You/Your/User”) access to and use of BLR Hubba Platform’ (which term shall be deemed to include the internet and mobile website{" "}
                <a href="https://blrhubba.in/" target="_blank" rel="noopener noreferrer" className="terms-email-link">
                    www.blrhubba.in
                </a>{" "}
                as well as its mobile application and any other means to access the same from time to time) and the services offered thereunder.
            </>,
            "The BLR Hubba Platform is owned and controlled by Unboxing BLR Foundation, a non-profit Section 8 Company incorporated under the Companies Act, 2013 with its registered office at 110/8, Krishnappa Layut, Lalbagh Road, Sampangiramnagar, Bengaluru 560 027 (hereinafter referred to as \"UBF/Us/Our/We\"). Through the BLR Hubba Platform, UBF provides information to You in relation to events that are organized by UBF and third-party entities including but not limited to the dates, venue, and other event-related information. You agree that for any issue or grievance under these T&C, Your recourse shall be solely to UBF.",
            "This T&C, along with the ‘Privacy Policy’ (available on the website) which constitutes an integral and inalienable part of the T&C, and any other applicable policies published on the BLR Hubba Platform, comprise a binding agreement between You and UBF. The ‘T&C’, ‘Privacy Policy’ and any such applicable policies constitute an electronic record under the Information Technology Act, 2000 as amended and the relevant rules made thereunder as applicable, and the amended provisions pertaining to electronic records in various statutes under applicable Indian laws.",
            "Your use of the BLR Hubba Platform and the services provided thereunder shall be governed by this T&C as well as any other applicable policies published on this BLR Hubba Platform, including but not limited to the Privacy Policy. Your use of the BLR Hubba Platform whether for the purpose of transacting through BLR Hubba Platform or otherwise, implies Your consent to the provisions of this T&C as well as any other applicable policies, including but not limited to UBF’s use of any information provided by You for the purpose of Your use of the BLR Hubba Platform. UBF hereby reserves the right to modify, add or delete any part of this T&C without any prior written notice/ intimation to You. It shall be Your sole responsibility to periodically review this T&C and all other applicable policies published on the BLR Hubba Platform for any revisions thereto. If You do not agree to any of the revisions made to this T&C by UBF, You must discontinue further access and use of the BLR Hubba Platform and the services provided thereunder. You agree and acknowledge that such discontinuance of access to and use of the BLR Hubba Platform and the services provided thereunder will render the T&C inapplicable from such date of discontinuance only; however, this T&C will remain applicable to all instances of use by You of BLR Hubba Platform and the services provided thereunder prior to such date of discontinuance."
        ]
    },
    {
        id: "copyright",
        title: "Copyright",
        paragraphs: [
            "The entire content included in the BLR Hubba Platform, including but not limited to text, graphics or code is copyrighted as a collective work under the Indian and all other copyright laws of the world, and is the sole property of UBF or is appropriately licensed by UBF from the relevant owners thereof. At no point of time, will the User have any rights and/ or claim to have acquired any rights in and to any part or portion of the BLR Hubba Platform and/ or any content contained therein, in any manner whatsoever.",
            "You may display and, subject to any expressly stated restrictions or limitations relating to specific material, download or print portions of the material from the different areas of the BLR Hubba Platform solely for Your own non-commercial use, or to place an order with BLR Hubba Platform or to purchase BLR Hubba Platform products.",
            "Any other use, including but not limited to the reproduction, distribution, display or transmission of the content of the BLR Hubba Platform is strictly prohibited, unless specifically authorized by UBF in writing."
        ]
    },
    {
        id: "trademarks",
        title: "Trademarks",
        paragraphs: [
            "All trademarks, service marks and trade names of “UBF” used on BLR Hubba Platform are trademarks or registered trademarks of Unboxing BLR Foundation, as the case may be. At no point of time, will the User have any rights and/or claim to have acquired any rights in and to any part or portion of the UBF trademarks and/ or logos, in any manner whatsoever."
        ]
    },
    {
        id: "indemnifications",
        title: "Indemnifications",
        paragraphs: [
            "You agree to indemnify, defend and hold harmless UBF and BLR Hubba Platform (including its directors, employees, officers, affiliates, consultants and agents)(each an \"Indemnified Party\") from and against any and all losses, liabilities, claims, damages, costs and expenses (including legal fees and disbursements in connection therewith and interest chargeable thereon) asserted against or incurred by Indemnified Parties that arise out of, result from, or may be payable by virtue of, any breach or non-performance of any representation, warranty, covenant or agreement made or obligation to be performed by the User, pursuant to these Terms and Conditions, or any acts committed by third parties not authorized by BLR Hubba, or in relation to any third party claims raised against Indemnified Parties in relation to the foregoing."
        ]
    },
    {
        id: "notifications",
        title: "Notifications",
        paragraphs: [
            "You are consenting to receive transactional and promotional messages, or notifications, as generated by the BLR Hubba Platform. We will be sending notifications to you by way of the following methods: SMS, Email, WhatsApp, or Voice Call.",
            <>
                Opt-out: We provide all Users with the opportunity to opt-out of receiving non-essential (promotional, marketing-related) communications from Us on behalf of our partners, and from Us in general, after setting up an account. If You want to remove Your contact information from all UBF lists and newsletters, please click on the unsubscribe links in the emailer. For opting out of receiving any transactional and promotional messages or notifications on your WhatsApp account, please reach out to us at{" "}
                <a href="mailto:support@blrhubba.in" className="terms-email-link">
                    support@blrhubba.in
                </a>{" "}
                and we will assist you.
            </>
        ]
    },
    {
        id: "your-consent",
        title: "Your Consent",
        paragraphs: [
            "By using the BLR Hubba Platform and/or by providing Your information, You consent to the collection and use of the information You disclose on BLR Hubba Platform in accordance with this Privacy Policy, including but not limited to Your consent for sharing your information as per this Privacy Policy. If We decide to change Our Privacy Policy, We will post those changes on this page so that You are always aware of what information We collect, how We use it, and under what circumstances We disclose it."
        ]
    },
    {
        id: "grievance-redressal",
        title: "Grievance Redressal",
        paragraphs: [
            <>
                Content In accordance with the provisions of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021, any grievances which You may have with respect to the information shared by You with BLR Hubba Platform hereunder and its treatment, may be directed by You to the customer support of BLR Hubba Platform. You may contact BLR Hubba Platform customer support by sending an email to{" "}
                <a href="mailto:support@blrhubba.in" className="terms-email-link">
                    support@blrhubba.in
                </a>
                . Your complaint shall be acknowledged within 24 hours and disposed of within 15 days from the date of receipt of complaint. If your complaint pertains to any material which exposes the private area, shows full nudity, depicts sexual act or is in nature of impersonation, the complaint shall be resolved within 24 hours from receipt of complaint.
            </>,
            <>
                Customer Experience At BLR Hubba, your experience is of utmost importance to us. Our team is always on their toes with one goal and that is delighting our customers and their experience with us. In any way, if you feel that we can do more to live up to your expectations then that would be an opportunity for us. Here are all the ways through which you can easily get in touch with us:{" "}
                <span className="terms-contact-bold-row">
                    (Phone & Text Message){" "}
                    <a href="tel:+916361188295" className="terms-email-link">
                        +91 6361188295
                    </a>{" "}
                    and (Email){" "}
                    <a href="mailto:support@blrhubba.in" className="terms-email-link">
                        support@blrhubba.in
                    </a>
                    .
                </span>
            </>,
            <>
                You can contact us at{" "}
                <a href="mailto:namaskara@blrhubba.in" className="terms-email-link">
                    namaskara@blrhubba.in
                </a>{" "}
                too.
            </>
        ]
    }
];

export const TermsOfServicePage = () => {
    return (
        <main className="terms-page">
            {/* HERO BANNER SECTION */}
            <section className="terms-hero-wrapper">
                <div className="terms-hero-card">
                    <span className="terms-hero-eyebrow">TERMS & CONDITIONS</span>
                    <h1 className="terms-hero-title">
                        Everything you need to know
                    </h1>
                </div>
            </section>

            {/* TERMS CONTENT SECTION */}
            <section className="terms-content-wrapper">
                <div className="terms-sections-container">
                    {TERMS_SECTIONS.map((section) => (
                        <article key={section.id} className="terms-section">
                            <h2 className="terms-section-title">{section.title}</h2>
                            <div className="terms-paragraphs-group">
                                {section.paragraphs.map((p, pIdx) => (
                                    <p key={pIdx} className="terms-paragraph">
                                        {p}
                                    </p>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default TermsOfServicePage;
