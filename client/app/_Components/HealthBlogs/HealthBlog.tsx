"use client"; 
 
 import React, { useEffect, useState } from "react";
 import styles from "./HealthBlog.module.css";
 import Link from "next/link";
 
 const blogs = [
   {
     title: "The Science of Stress Relief",
     description: "Explore effective techniques to manage stress and improve your mental health.",
     link: "https://www.medanta.org/patient-education-blog/exercise-stress-get-moving-to-manage-stress",
   },
   {
     title: " Healthy Aging: Tips for Longevity",
     description: "Practical advice on staying active, eating well, and aging gracefully.",
     link: "https://www.mountcarmelhealth.com/newsroom/blog-articles/embracing-healthy-aging-tips-vibrant-life-any-age#:~:text=Avoid%20Harmful%20Habits%3A%20There%20are,more%20likely%20to%20age%20healthfully.",
   },
   {
     title: "Digital Detox: Reclaim Your Life",
     description: "Discover the benefits of unplugging and how to start your own digital detox.",
     link: "https://continentalhospitals.com/blog/digital-detox-reclaiming-your-life-from-technology/",
   },
   {
     title: " Aromatherapy for Beginners",
     description: "A guide to using essential oils for relaxation, sleep, and mood enhancement.",
     link: "https://www.takingcharge.csh.umn.edu/survivorship/aromatherapy-beginners",
   },
 ];
 
 const HealthBlog = () => {
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     setLoading(false);
   }, []);
 
   if (loading) {
     return <div className={styles.loader}>Loading...</div>;
   }
 
   return (
     <div className={styles.container}>
       <h1 className={styles.header}>Health Blog</h1>
       <p className={styles.subtext}>Stay informed with the latest health tips and insights.</p>
       <div className={styles.blogList}>
         {blogs.map((blog, index) => (
           <div key={index} className={styles.card}>
             <h2>{blog.title}</h2>
             <p>{blog.description}</p>
             <Link href={blog.link} target="_blank" className={styles.link}>
               Read More
             </Link>
           </div>
         ))}
       </div>
     </div>
   );
 };
 
 export default HealthBlog;