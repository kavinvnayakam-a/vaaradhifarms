import CustomerView from '@/components/customer-view';
import { Suspense } from 'react';
import Image from 'next/image';
import TableSelection from '@/components/table-selection';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {

  const tableId = searchParams?.table as string | undefined;

  if (!tableId) {
    return (
       <Suspense>
         <TableSelection />
       </Suspense>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden">
          <div className="relative flex flex-col items-center">
            <div className="relative bg-white px-8 py-4 rounded-[2rem] shadow-2xl animate-pulse">
              <Image 
                src={LOGO_URL} 
                alt="Vaaradhi Farms Logo" 
                width={160} 
                height={69} 
                className="object-contain"
              />
            </div>

            <div className="mt-12 text-center space-y-3">
              <h1 className="text-white text-2xl font-black tracking-[0.2em] uppercase italic">
                Vaaradhi <span className="text-primary">Farms</span>
              </h1>
              
              <div className="w-48 h-[1px] bg-white/10 mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-primary animate-[loading_1.5s_ease-in-out_infinite]" />
              </div>
              
              <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase animate-pulse">
                Gathering the harvest
              </p>
            </div>
          </div>
        </div>
      }
    >
      <CustomerView tableId={tableId} mode={tableId === 'Takeaway' ? 'takeaway' : 'dine-in'} />
    </Suspense>
  );
}
