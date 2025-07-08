import React, { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useModal } from "./contexts/ModalContext";
import HeaderWithNavbar from "./components/layout/HeaderWithNavbar";
import Footer from "./components/layout/Footer";
import Modal from "./components/common/Modal/Modal";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import "./App.css";

// 3. PAGE COMPONENTS (LAZY LOAD)
const IntroSection = lazy(() => import("./components/home/IntroSection"));
const FeaturesSection = lazy(() => import("./components/home/FeaturesSection"));
const PengumumanTerbaruSection = lazy(() =>
  import("./components/home/PengumumanTerbaruSection")
);
const Explore = lazy(() => import("./pages/public/Explore/Explore"));
const PrivacyPolicy = lazy(() =>
  import("./pages/public/PrivacyPolicy/PrivacyPolicy")
);
const HalamanSemuaPengumuman = lazy(() =>
  import("./pages/public/Pengumuman/HalamanSemuaPengumuman")
);
const HalamanDetailPengumuman = lazy(() =>
  import("./pages/public/Pengumuman/HalamanDetailPengumuman")
);
const HalamanSemuaArtikel = lazy(() =>
  import("./pages/public/Artikel/HalamanSemuaArtikel")
);
const HalamanDetailArtikel = lazy(() =>
  import("./pages/public/Artikel/HalamanDetailArtikel")
);
const HalamanDataCuaca = lazy(() =>
  import("./pages/public/Cuaca/HalamanDataCuaca")
);
const HalamanDetailGunung = lazy(() =>
  import("./pages/public/Gunung/HalamanDetailGunung")
);
const LaporError = lazy(() => import("./pages/public/LaporError/LaporError"));
const HalamanTentangKami = lazy(() =>
  import("./pages/public/Tentang/HalamanTentangKami")
);
const KetentuanLayanan = lazy(() =>
  import("./pages/public/KetentuanLayanan/KetentuanLayanan")
);
const HalamanFAQ = lazy(() => import("./pages/public/FAQ/HalamanFAQ"));
const HalamanProfilSaya = lazy(() =>
  import("./pages/public/Profil/HalamanProfilSaya")
);
const HalamanDetailJalur = lazy(() =>
  import("./pages/public/Jalur/HalamanDetailJalur")
);

// Halaman Admin (LAZY LOAD)
const DashboardAdmin = lazy(() => import("./pages/dashboard/DashboardAdmin"));
const KelolaPengguna = lazy(() =>
  import("./pages/admin/pengguna/KelolaPengguna")
);
const TambahPengguna = lazy(() =>
  import("./pages/admin/pengguna/TambahPengguna")
);
const EditPengguna = lazy(() => import("./pages/admin/pengguna/EditPengguna"));
const KelolaGunung = lazy(() => import("./pages/admin/gunung/KelolaGunung"));
const TambahGunung = lazy(() => import("./pages/admin/gunung/TambahGunung"));
const EditGunung = lazy(() => import("./pages/admin/gunung/EditGunung"));
const KelolaJalur = lazy(() => import("./pages/admin/jalur/KelolaJalur"));
const TambahJalur = lazy(() => import("./pages/admin/jalur/TambahJalur"));
const EditJalur = lazy(() => import("./pages/admin/jalur/EditJalur"));
const KelolaPoi = lazy(() => import("./pages/admin/poi/KelolaPoi"));
const TambahPoi = lazy(() => import("./pages/admin/poi/TambahPoi"));
const EditPoi = lazy(() => import("./pages/admin/poi/EditPoi"));
const KelolaArtikel = lazy(() => import("./pages/admin/artikel/KelolaArtikel"));
const TambahArtikel = lazy(() => import("./pages/admin/artikel/TambahArtikel"));
const EditArtikel = lazy(() => import("./pages/admin/artikel/EditArtikel"));
const KelolaGaleri = lazy(() => import("./pages/admin/galeri/KelolaGaleri"));
const TambahGaleri = lazy(() => import("./pages/admin/galeri/TambahGaleri"));
const KelolaPengumuman = lazy(() =>
  import("./pages/admin/pengumuman/KelolaPengumuman")
);
const TambahEditPengumuman = lazy(() =>
  import("./pages/admin/pengumuman/TambahEditPengumuman")
);
const KelolaTags = lazy(() => import("./pages/admin/tags/KelolaTags"));
const KelolaUlasan = lazy(() => import("./pages/admin/ulasan/KelolaUlasan"));
const KelolaLaporanError = lazy(() =>
  import("./pages/admin/laporan/KelolaLaporanError")
);
const KelolaProfil = lazy(() => import("./pages/admin/profil/KelolaProfil"));

// Wrapper untuk Halaman Publik agar memiliki padding yang konsisten
const PublicPageWrapper = ({ children }) => {
  return <main className="public-page-wrapper">{children}</main>;
};

function App() {
  const location = useLocation();
  const { modalType } = useModal();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const renderModalContent = () => {
    switch (modalType) {
      case "login":
        return <Login />;
      case "register":
        return <Register />;
      case "forgotPassword":
        return <ForgotPassword />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <ScrollToTop />
      <Modal>{renderModalContent()}</Modal>
      {!isAdminRoute && <HeaderWithNavbar />}
      <main className="main-container">
        <Suspense
          fallback={
            <div style={{ textAlign: "center", marginTop: 40 }}>
              Memuat halaman...
            </div>
          }
        >
          <Routes>
            {/* --- RUTE PUBLIK --- */}
            <Route
              path="/"
              element={
                <>
                  <IntroSection />
                  <PengumumanTerbaruSection />
                  <FeaturesSection />
                  {/* <ArtikelTerbaruSection />  <-- PERBAIKAN: Baris ini dihapus */}
                </>
              }
            />
            <Route
              path="/explore"
              element={
                <PublicPageWrapper>
                  <Explore />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PublicPageWrapper>
                  <PrivacyPolicy />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/pengumuman"
              element={
                <PublicPageWrapper>
                  <HalamanSemuaPengumuman />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/pengumuman/:id_pengumuman"
              element={<HalamanDetailPengumuman />}
            />
            <Route
              path="/artikel"
              element={
                <PublicPageWrapper>
                  <HalamanSemuaArtikel />
                </PublicPageWrapper>
              }
            />
            <Route path="/artikel/:slug" element={<HalamanDetailArtikel />} />
            <Route
              path="/cuaca"
              element={
                <PublicPageWrapper>
                  <HalamanDataCuaca />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/gunung/:id_gunung"
              element={
                <PublicPageWrapper>
                  <HalamanDetailGunung />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/lapor-error"
              element={
                <PublicPageWrapper>
                  <LaporError />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/tentang"
              element={
                <PublicPageWrapper>
                  <HalamanTentangKami />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/ketentuan-layanan"
              element={
                <PublicPageWrapper>
                  <KetentuanLayanan />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/faq"
              element={
                <PublicPageWrapper>
                  <HalamanFAQ />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/profil-saya"
              element={
                <PublicPageWrapper>
                  <HalamanProfilSaya />
                </PublicPageWrapper>
              }
            />
            <Route
              path="/jalur/:idJalur"
              element={
                <PublicPageWrapper>
                  <HalamanDetailJalur />
                </PublicPageWrapper>
              }
            />

            {/* --- RUTE ADMIN YANG DILINDUNGI --- */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardAdmin />} />
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/users" element={<KelolaPengguna />} />
                <Route path="/admin/users/new" element={<TambahPengguna />} />
                <Route
                  path="/admin/users/edit/:id_user"
                  element={<EditPengguna />}
                />
                <Route path="/admin/gunung" element={<KelolaGunung />} />
                <Route path="/admin/gunung/new" element={<TambahGunung />} />
                <Route
                  path="/admin/gunung/edit/:id_gunung"
                  element={<EditGunung />}
                />
                <Route path="/admin/jalur" element={<KelolaJalur />} />
                <Route path="/admin/jalur/new" element={<TambahJalur />} />
                <Route
                  path="/admin/jalur/edit/:id_jalur"
                  element={<EditJalur />}
                />
                <Route path="/admin/poi" element={<KelolaPoi />} />
                <Route path="/admin/poi/new" element={<TambahPoi />} />
                <Route path="/admin/poi/edit/:id_poi" element={<EditPoi />} />
                <Route path="/admin/articles" element={<KelolaArtikel />} />
                <Route path="/admin/articles/new" element={<TambahArtikel />} />
                <Route
                  path="/admin/articles/edit/:id_artikel"
                  element={<EditArtikel />}
                />
                <Route path="/admin/tags" element={<KelolaTags />} />
                <Route path="/admin/gallery" element={<KelolaGaleri />} />
                <Route path="/admin/gallery/new" element={<TambahGaleri />} />
                <Route path="/admin/reviews" element={<KelolaUlasan />} />
                <Route
                  path="/admin/announcements"
                  element={<KelolaPengumuman />}
                />
                <Route
                  path="/admin/announcements/new"
                  element={<TambahEditPengumuman />}
                />
                <Route
                  path="/admin/announcements/edit/:id_pengumuman"
                  element={<TambahEditPengumuman />}
                />
                <Route
                  path="/admin/laporan-error"
                  element={<KelolaLaporanError />}
                />
                <Route path="/admin/profil" element={<KelolaProfil />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
