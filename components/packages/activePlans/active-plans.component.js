import styles from "@/components/packages/activePlans/active-plans.module.scss";

const ActivePlans = ({ userActivepackages,ismobile,title }) => {
  return (
    <>
      {userActivepackages && userActivepackages.map((activePackage, index) => {
        return (<div className={`${styles.active_plan} ${ismobile ? styles.ismobile : ''}`} key={index}>
          <div className={`${styles.active_plan_inner}`}>
            <div className={`${styles.active_plan_header}`}>
              <p> {title ? title : 'you are already subscribed'}</p>
              </div>
              <div className={`${styles.active_plan_body}`}>
                <div className={`${styles.active_plan_details}`}>
                  <div className={`${styles.active_plan_name}`}>
                    <span className={`${styles.label}`}>Current Active Plan</span>
                    <span className={`${styles.value}`}>{activePackage.name}</span>
                  </div>
                  <div className={`${styles.active_plan_expiry}`}>
                    <span className={`${styles.label}`}>Expiration date</span>
                    <span className={`${styles.value}`}>{activePackage.message}</span>
                  </div>
                </div>
              </div>
            </div>
        </div>)
      })}

    </>
  );

};

export default ActivePlans;
