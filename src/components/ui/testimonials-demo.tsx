import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Buying property with Shree Jee Real Estate was a dream come true. They helped me find a beautiful plot in a serene location that exceeded my expectations.",
    image: "https://media.licdn.com/dms/image/v2/D5635AQFs3OP4XB67Ow/profile-framedphoto-shrink_400_400/B56ZrNoWsZJUAc-/0/1764386499798?e=1768917600&v=beta&t=6hEG6WSF5AuvNaL1CnnEjnem5s7xhcxkOOZFJLO3wHY",
    name: "Abhinav Choudhary",
  },
  {
    text: "The process of purchasing land was incredibly smooth. Their team guided me every step of the way, ensuring I made the right investment for my future.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQE0epUdy8Y_8g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1722691844280?e=1769644800&v=beta&t=n8m6gl0TsdAze-cSvbC9zgujsycdgdoVvsI1aPjiDTY",
    name: "Ritik",
  },
  {
    text: "I was looking for a peaceful environment for my family, and Shree Jee delivered. The location is breathtaking, surrounded by nature and tranquility.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQH2eWkHLL5SAw/profile-displayphoto-scale_400_400/B56Zq9ljnGHQAg-/0/1764117331589?e=1769644800&v=beta&t=s2KnFAH3F2PoCAW5e8vmOdZJy3BwBtBmtmOJFJfY_sE",
    name: "Arjit Malik",
  },
  {
    text: "Their transparency and dedication are unmatched. I felt confident investing in my plot, knowing I was in safe hands with Shree Jee Real Estate.",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQGPcoyHdmAslA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1674529384256?e=1769644800&v=beta&t=u5VrF1Xm80B8V67eu0kSRDtv6G1QqKPcDU1inee3dmM",
    name: "Ashu Choudhary",
  },
  {
    text: "The best decision I ever made was choosing Shree Jee. The serene atmosphere of the location is exactly what I needed to escape the city noise.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQFWB4kgkZotPw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1724646895872?e=1769644800&v=beta&t=8K1p9aXOUgIY6899FT3MY-uMz-5W3e8EAWMjVExtFYY",
    name: "Zainab Hussain",
  },
  {
    text: "Great experience! They understood my needs perfectly and showed me plots that were not only affordable but also in prime, peaceful areas.",
    image: "https://media.licdn.com/dms/image/v2/D5635AQGiF2YI__Y85g/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1715706270316?e=1768917600&v=beta&t=5c5iAUKmyOKYd-A9mo9n9bHlPzkaA2wZeUTZH88eiUU",
    name: "Aliza Khan",
  },
  {
    text: "I highly recommend Shree Jee Real Estate for anyone looking to buy land. Their commitment to quality and customer satisfaction is evident.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
    name: "Farha khan",
  },
  {
    text: "Finding a plot that offered both value and serenity was hard until I met the Shree Jee team. They made it happen effortlessly.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
    name: "Sana Sheikh",
  },
  {
    text: "A truly professional team. They helped me secure a fantastic piece of land where I can build my dream home in a calm and beautiful setting.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQEo7ScJqHSOpA/profile-displayphoto-shrink_400_400/B56ZPwOzNkGsAg-/0/1734902232581?e=1769644800&v=beta&t=ic4D7t6O_w9S8CZbASqC3PMyFI7OEtOEiz_sWavzQr4",
    name: "Nitin Kapasiya",
  },
];


const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);


const Testimonials = () => {
  return (
    <section className="bg-background my-20 relative">

      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg">Testimonials</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What our users say
          </h2>
          <p className="text-center mt-5 opacity-75">
            See what our customers have to say about us.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;