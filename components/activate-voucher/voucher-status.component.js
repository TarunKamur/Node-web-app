import Link from "next/link";
import styles from '@/components/activate-voucher/activate-voucher.module.scss'
import { useStore } from '@/store/store';
import { ActivateVoucher } from "@/.i18n/locale";

const VoucherStatus = ({voucherData, date}) => {
    const { state: { localLang }, } = useStore();

    const deviceName = () => {
        const device = voucherData?.maxClientSession?.web ? `${voucherData?.maxClientSession?.web} PC` :
        voucherData?.maxClientSession?.mobile ? `${voucherData?.maxClientSession?.mobile} Mobiles` :
        voucherData?.maxClientSession?.tv ? `${voucherData?.maxClientSession?.tv}` : ''
        return device;
    }

    const padTo2Digits = (num) => {
        return num.toString().padStart(2, '0');
      }
      
    const  formatDate = (date) => {
        return [
          padTo2Digits(date.getDate()),
          padTo2Digits(date.getMonth() + 1),
          date.getFullYear(),
        ].join('/');
      }
    
    return <div className={`${styles.voucher_status_data}`}>
        <h2>{voucherData?.message}</h2>
        <h3>{ActivateVoucher[localLang]?.You_have_Subscribed_to}</h3>
        <p>{voucherData?.activatedPackages['0']?.master?.name}</p>
        <p>{ActivateVoucher[localLang]?.Valid_From} {formatDate(date)} {ActivateVoucher[localLang]?.To} {formatDate(new Date(voucherData?.activatedPackages['0']?.packages[0]?.activationDuration?.effectiveTo))}.</p>
        <h3>{ActivateVoucher[localLang]?.You_can_access_your_subscribed_content_on} {deviceName()}
        </h3>
        <Link href="/" prefetch={false}> Start Watching <img src="https://d2ivesio5kogrp.cloudfront.net/static/images/right-arrow.png" alt="back"/></Link>
    </div>
}

export default VoucherStatus;