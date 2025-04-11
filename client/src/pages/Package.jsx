import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  Box,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  Skeleton,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [placeFilters, setPlaceFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [durationRange, setDurationRange] = useState([1, 30]);
  const [sortOption, setSortOption] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const applyFilters = () => {
    let filtered = [...packages];
    if (categoryFilters.length > 0) {
      filtered = filtered.filter(pkg => categoryFilters.includes(pkg.category));
    }
    if (placeFilters.length > 0) {
      filtered = filtered.filter(pkg => placeFilters.includes(pkg.location));
    }
    filtered = filtered.filter(pkg => pkg.price >= priceRange[0] && pkg.price <= priceRange[1]);
    filtered = filtered.filter(pkg => pkg.duration >= durationRange[0] && pkg.duration <= durationRange[1]);

    if (sortOption === "popular") {
      filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortOption === "ratings") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredPackages(filtered);
  };

  const resetFilters = () => {
    setCategoryFilters([]);
    setPlaceFilters([]);
    setPriceRange([0, 100000]);
    setDurationRange([1, 30]);
    setSortOption("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: packagesData } = await supabase.from("tour_packages").select("*");
      setPackages(packagesData);
      setFilteredPackages(packagesData);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [categoryFilters, placeFilters, priceRange, durationRange, sortOption]);

  return (
    <ThemeProvider theme={createTheme({ palette: { mode: darkMode ? "dark" : "light" } })}>
      <Box display="flex" flexDirection="column" gap={2} p={2}>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️" : "🌙"}
            </IconButton>
            <Button variant="outlined" onClick={resetFilters}>
              Reset Filters
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1">Sort By:</Typography>
            <Select
              size="small"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="popular">
                <Box display="flex" alignItems="center" gap={1}>
                  <FavoriteIcon fontSize="small" /> Most Popular
                </Box>
              </MenuItem>
              <MenuItem value="ratings">
                <Box display="flex" alignItems="center" gap={1}>
                  <StarIcon fontSize="small" /> Best Ratings
                </Box>
              </MenuItem>
            </Select>
          </Box>
        </Box>

        <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2}>
          {/* Filters Sidebar */}
          <Box flex={1} minWidth={isMobile ? "100%" : "250px"}>
            <Accordion expanded={expanded || !isMobile} onChange={() => setExpanded(!expanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Filters <TuneIcon />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1">Categories</Typography>
                {Array.from(new Set(packages.map(pkg => pkg.category))).map(cat => (
                  <FormControlLabel
                    key={cat}
                    control={
                      <Checkbox
                        checked={categoryFilters.includes(cat)}
                        onChange={() =>
                          setCategoryFilters(prev =>
                            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                          )
                        }
                      />
                    }
                    label={cat}
                  />
                ))}

                <Typography variant="subtitle1" mt={2}>Places</Typography>
                {Array.from(new Set(packages.map(pkg => pkg.location))).map(loc => (
                  <FormControlLabel
                    key={loc}
                    control={
                      <Checkbox
                        checked={placeFilters.includes(loc)}
                        onChange={() =>
                          setPlaceFilters(prev =>
                            prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
                          )
                        }
                      />
                    }
                    label={loc}
                  />
                ))}

                <Typography variant="subtitle1" mt={2}>Price Range (₹)</Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, val) => setPriceRange(val)}
                  min={0}
                  max={100000}
                  step={500}
                  valueLabelDisplay="auto"
                />

                <Typography variant="subtitle1" mt={2}>Duration (days)</Typography>
                <Slider
                  value={durationRange}
                  onChange={(e, val) => setDurationRange(val)}
                  min={1}
                  max={30}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Packages Grid */}
          <Box flex={3}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr"
                },
                gap: 2
              }}
            >
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Box key={i}>
                      <Skeleton variant="rectangular" height={200} />
                      <Skeleton width="60%" />
                      <Skeleton width="40%" />
                    </Box>
                  ))
                : filteredPackages.length === 0
                ? <Typography variant="body1">No matching packages found.</Typography>
                : filteredPackages.map(pkg => (
                    <Link to={`/package/${pkg.id}`} key={pkg.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box
                        sx={{
                          borderRadius: 2,
                          boxShadow: 2,
                          bgcolor: "background.paper",
                          p: 2,
                          transition: "0.3s",
                          "&:hover": { boxShadow: 6 },
                        }}
                      >
                        <img
                          src={pkg.image_urls?.[0] || "/assets/images/default-package.jpg"}
                          alt={pkg.title}
                          style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8 }}
                        />
                        <Typography variant="h6" mt={1}>{pkg.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{pkg.location}</Typography>
                        <Typography variant="body2">₹{pkg.price} • {pkg.duration} days</Typography>
                        <Typography variant="caption" color="text.secondary">{pkg.category}</Typography>
                      </Box>
                    </Link>
                  ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
