import React from "react";

const StrukPrint = React.forwardRef(({ transaction, user }, ref) => {
  if (!transaction) return null;

  const { transaction_id, total_price, items } = transaction;
  const now = new Date().toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <div 
      ref={ref} 
      style={{
        width: "80mm",
        padding: "5mm",
        fontFamily: "monospace",
        fontSize: "12px",
        lineHeight: "1.4",
        color: "#000",
        backgroundColor: "#fff"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "5px" }}>
        <h3 style={{ margin: 0, fontSize: "14px" }}>SISKO KASIR</h3>
        <p style={{ margin: 0, fontSize: "10px" }}>Jl. Merdeka No. 123</p>
      </div>
      
      <hr style={{ border: "none", borderTop: "1px dashed #000", margin: "5px 0" }} />
      
      <div style={{ fontSize: "10px", marginBottom: "5px" }}>
        <p style={{ margin: 0 }}>No: #{String(transaction_id).padStart(6, '0')}</p>
        <p style={{ margin: 0 }}>Kasir: {user?.username || 'Admin'}</p>
        <p style={{ margin: 0 }}>Tanggal: {now}</p>
      </div>
      
      <hr style={{ border: "none", borderTop: "1px dashed #000", margin: "5px 0" }} />
      
      {items?.map((item, idx) => (
        <div key={idx} style={{ marginBottom: "3px" }}>
          <p style={{ margin: 0 }}>{item.name}</p>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
            <span>{item.qty} x Rp{Number(item.price).toLocaleString("id-ID")}</span>
            <span>Rp{Number(item.price * item.qty).toLocaleString("id-ID")}</span>
          </div>
        </div>
      ))}
      
      <hr style={{ border: "none", borderTop: "1px dashed #000", margin: "5px 0" }} />
      
      <div style={{ fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}>
          <span>TOTAL</span>
          <span>Rp{Number(total_price).toLocaleString("id-ID")}</span>
        </div>
      </div>
      
      <p style={{ textAlign: "center", fontSize: "10px", margin: "10px 0 0 0" }}>
        Terima kasih atas kunjungannya
      </p>
    </div>
  );
});

StrukPrint.displayName = "StrukPrint";
export default StrukPrint;