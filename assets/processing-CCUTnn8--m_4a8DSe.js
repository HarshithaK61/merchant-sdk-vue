const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-d3_aBOwB.js","assets/index-3l2-8cxh.css"])))=>i.map(i=>d[i]);
import{_ as c}from"./index-d3_aBOwB.js";import{C as d}from"./concordium-modal-logo-DS-Kh-HG-U74C0ajH.js";const p="data:image/svg+xml,%3csvg%20width='55'%20height='86'%20viewBox='0%200%2055%2086'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20y='33.5706'%20width='54.302'%20height='52.4295'%20rx='8'%20fill='%232667FF'/%3e%3cmask%20id='path-2-inside-1_2207_2963'%20fill='white'%3e%3cpath%20d='M27.333%200C39.6671%204.53556e-05%2049.666%209.9989%2049.666%2022.333V67.002H5V22.333C5%209.99887%2014.9989%200%2027.333%200Z'/%3e%3c/mask%3e%3cpath%20d='M27.333%200L27.333%20-8H27.333V0ZM49.666%2067.002V75.002H57.666V67.002H49.666ZM5%2067.002H-3V75.002H5V67.002ZM27.333%200L27.333%208C35.2488%208.00003%2041.666%2014.4172%2041.666%2022.333H49.666H57.666C57.666%205.5806%2044.0854%20-7.99994%2027.333%20-8L27.333%200ZM49.666%2022.333H41.666V67.002H49.666H57.666V22.333H49.666ZM49.666%2067.002V59.002H5V67.002V75.002H49.666V67.002ZM5%2067.002H13V22.333H5H-3V67.002H5ZM5%2022.333H13C13%2014.4172%2019.4172%208%2027.333%208V0V-8C10.5806%20-8%20-3%205.5806%20-3%2022.333H5Z'%20fill='%232667FF'%20mask='url(%23path-2-inside-1_2207_2963)'/%3e%3ccircle%20cx='26.9997'%20cy='61'%20r='13.0639'%20transform='rotate(75%2026.9997%2061)'%20stroke='%235A8AFC'%20stroke-width='5'/%3e%3cpath%20d='M30.3809%2073.6188C37.3501%2071.7514%2041.4859%2064.588%2039.6185%2057.6188C37.7511%2050.6496%2030.5877%2046.5138%2023.6185%2048.3812'%20stroke='white'%20stroke-width='5'/%3e%3c/svg%3e",m="data:image/svg+xml,%3csvg%20width='55'%20height='86'%20viewBox='0%200%2055%2086'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20y='33.5706'%20width='54.302'%20height='52.4295'%20rx='8'%20fill='%232667FF'/%3e%3cmask%20id='path-2-inside-1_2207_2999'%20fill='white'%3e%3cpath%20d='M27.333%200C39.6671%204.53556e-05%2049.666%209.9989%2049.666%2022.333V67.002H5V22.333C5%209.99887%2014.9989%200%2027.333%200Z'/%3e%3c/mask%3e%3cpath%20d='M27.333%200L27.333%20-8H27.333V0ZM49.666%2067.002V75.002H57.666V67.002H49.666ZM5%2067.002H-3V75.002H5V67.002ZM27.333%200L27.333%208C35.2488%208.00003%2041.666%2014.4172%2041.666%2022.333H49.666H57.666C57.666%205.5806%2044.0854%20-7.99994%2027.333%20-8L27.333%200ZM49.666%2022.333H41.666V67.002H49.666H57.666V22.333H49.666ZM49.666%2067.002V59.002H5V67.002V75.002H49.666V67.002ZM5%2067.002H13V22.333H5H-3V67.002H5ZM5%2022.333H13C13%2014.4172%2019.4172%208%2027.333%208V0V-8C10.5806%20-8%20-3%205.5806%20-3%2022.333H5Z'%20fill='%232667FF'%20mask='url(%23path-2-inside-1_2207_2999)'/%3e%3cpath%20d='M13%2061.436L21.0784%2069L40%2051'%20stroke='white'%20stroke-width='6'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";let t=null;const l=(s="loading")=>{const a=`
    <div class="desktop--modal-overlay">
        <div class="desktop--modal-container">
            <div class="desktop--modal-body">
                <div class="flex items-center justify-end p-2">
                    <img
                        src="${d}"
                        alt="concordium-modal-logo"
                        class="object-cover"
                    />
                </div>

                <div class="flex items-center justify-center">
                    <img src="${s==="loading"?p:m}" alt="${s}-icon" class="object-cover" />
                </div>

                <div class="flex flex-col items-center gap-2">
                    <p class="font-medium text-[20px] leading-[25px] tracking-[0.2px] font-jakarta">
                        ${s==="loading"?"Verification in Progress":"Success!"}
                    </p>
                    <p class="font-normal text-[12px] leading-[19px] tracking-[0px] font-inter">
                        ${s==="loading"?"Approve in your ConcordiumID App":"Verification completed"}
                    </p>
                </div>

                <div class="flex items-center justify-center gap-3 mt-3">
                    ${s==="loading"?`
                                <button disabled class="desktop--disabled-button" id="approve-btn">
                                    <span>Please wait</span>
                                </button>
                            `:`
                                <button class="desktop--primary-button" id="close-btn">
                                    <span>Close</span>
                                </button>
                            `}
                </div>
            </div>
        </div>
    </div>
`,e=document.createElement("div");return e.innerHTML=a,e.querySelector("#close-btn")?.addEventListener("click",async()=>{if(console.log("Close clicked"),s==="success"){const{dispatchConcordiumEvent:i}=await c(async()=>{const{dispatchConcordiumEvent:r}=await import("./index-d3_aBOwB.js").then(o=>o.m);return{dispatchConcordiumEvent:r}},__vite__mapDeps([0,1]));i({type:"close",source:"desktop",modalType:"processing",data:{state:"success",action:"close"}})}u()}),e.firstElementChild},v=async()=>{const{getGlobalContainer:s}=await c(async()=>{const{getGlobalContainer:o}=await import("./index-d3_aBOwB.js").then(n=>n.m);return{getGlobalContainer:o}},__vite__mapDeps([0,1])),a=s();if(!a){console.error("Container not found for processing modal");return}const e=a.querySelector(".desktop--modal-overlay");t=l("loading"),t.id="processing-modal";const i=t.querySelector(".desktop--modal-container");t.style.opacity="0",i.style.transform="translateY(-20px) scale(0.95)",i.style.transition="transform 0.3s ease-out",a.appendChild(t),t.offsetHeight,t.style.transition="opacity 0.3s ease-out",setTimeout(()=>{if(e){const o=e.querySelector(".desktop--modal-container");e.style.transition="opacity 0.3s ease-in",o&&(o.style.transition="transform 0.3s ease-in",o.style.transform="translateY(-20px) scale(0.95)"),e.style.opacity="0",e.style.pointerEvents="none",e.style.zIndex="9998"}t.style.opacity="1",i.style.transform="translateY(0) scale(1)",e&&setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},350)},10),e&&setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},300);const{dispatchConcordiumEvent:r}=await c(async()=>{const{dispatchConcordiumEvent:o}=await import("./index-d3_aBOwB.js").then(n=>n.m);return{dispatchConcordiumEvent:o}},__vite__mapDeps([0,1]));r({type:"processing",source:"desktop",modalType:"processing",data:{state:"loading",message:"Verification in progress"}})},u=()=>{t&&(t.classList.add("modal-exiting"),setTimeout(()=>{const s=t?.parentNode;s&&t&&s.removeChild(t),t=null},300))};async function y(){const{getGlobalContainer:s}=await c(async()=>{const{getGlobalContainer:o}=await import("./index-d3_aBOwB.js").then(n=>n.m);return{getGlobalContainer:o}},__vite__mapDeps([0,1])),a=s();if(!a||!t){console.error("Container or modal element not found");return}const e=t,i=l("success");i.id="processing-modal",i.classList.add("modal-entering"),a.appendChild(i),requestAnimationFrame(()=>{e&&e.classList.add("modal-exiting"),requestAnimationFrame(()=>{i.classList.remove("modal-entering"),i.classList.add("modal-visible")})}),t=i,e&&setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},300);const{dispatchConcordiumEvent:r}=await c(async()=>{const{dispatchConcordiumEvent:o}=await import("./index-d3_aBOwB.js").then(n=>n.m);return{dispatchConcordiumEvent:o}},__vite__mapDeps([0,1]));r({type:"success",source:"desktop",modalType:"processing",data:{state:"success",message:"Verification completed successfully"}})}export{l as createProcessingModal,u as hideProcessingModal,v as showProcessingModal,y as showSuccessState};
