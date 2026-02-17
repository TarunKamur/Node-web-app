import React, { useState, useEffect } from 'react';
import styles from "./dynamicSeoFooter.module.scss";
import Breadcrumb from '@/components/breadCrumb/breadCrumb.component';

const DynamicSeoComponent = ({ dynamicSeo }) => {
  const dynamicItems = dynamicSeo?.filter(item => item.templateType === 'dynamic') || [];
  const staticItems = dynamicSeo?.filter(item => item.templateType === 'static') || [];

  const [openIds, setOpenIds] = useState({});
  const [showFullDescription, setShowFullDescription] = useState({});

 useEffect(() => {
  
  setShowFullDescription({});
}, [dynamicSeo]);


  const toggleDescription = (index) => {
    setShowFullDescription(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAccordion = (id) => {
    if (window.innerWidth < 767) {
      setOpenIds(prev => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  return (
    <div className={`${styles.dynamicSeoFooter}`}>
      <div className={`container ${styles.container}`}>
         {/* <Breadcrumb /> */}
        {dynamicItems.length > 0 &&
          dynamicItems.map((item, index) => {
            const fullContent = item.content || '';
            const isLong = fullContent.length > 500;
            const showFull = showFullDescription[index];

            return (
              <div className={styles.dynamicData} key={`dynamic-${index}`}>
                {/* <div className={styles.name}>{item.name}</div> */}
                <div
                  className={`movie_details ${styles.movie_details} ${showFull ? `expand ${styles.expand}` : ''}`}
                  dangerouslySetInnerHTML={{ __html: fullContent }}
                />
                {isLong && (
                  <button
                    type="button"
                    className={styles.morebtn}
                    onClick={() => toggleDescription(index)}
                  >
                    {showFull ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            );
          })}

       
        {staticItems.length > 0 &&
          staticItems.map((item, index) => {
            let content = [];
            try {
              content = JSON.parse(item.content);
            } catch (e) {
              
            }
            return (
              <div className={styles.staticLinks} key={`static-${index}`}>
                {/* <div className={styles.name}>{item.name}</div> */}
                <div className={styles.staticBlock}>
                  {content.map((section, i) => {
                    const sectionId = `accordion-${index}-${i}`;
                    const isOpen = openIds[sectionId];

                    return (
                     section.datalink &&
                      section.datalink?.length > 0 && (
                        <div
                          key={i}
                          className={`${styles.section} ${isOpen ? styles.isOpen : ''}`}
                          id={sectionId}
                        >
                          <div
                            className={styles.title}
                            onClick={() => toggleAccordion(sectionId)}
                          >
                            {section.title}
                          </div>
                          <ul className={styles.linkList}>
                            {section.datalink.map((link, j) => (
                              <li key={j}>
                                <a href={link.target} target="_self" rel="">
                                  {link.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default DynamicSeoComponent;
