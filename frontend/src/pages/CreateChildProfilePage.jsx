import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Define the main interests
const INTERESTS = [
  'Math', 'Biology', 'Chemistry', 'Physics', 'Earth Science', 'Reading', 'Writing', 'History', 
  'Art', 'Music', 'Coding', 'Sports', 'Nature', 
  'Geography', 'Languages', 'Social Studies'
];

// Grade levels
const GRADES = [
  'Pre-K', 'Kindergarten', 
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade',
  '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
];

// Sub-interests organized by parent interest and specific grade level
const SUB_INTERESTS = {
  'Math': {
    'Pre-K': [
      'Number recognition (1-10)', 'Basic counting', 'Shape identification', 'Simple patterns', 'Size comparison'
    ],
    'Kindergarten': [
      'Counting to 100', 'Addition/subtraction within 5', '2D and 3D shapes', 'Pattern creation', 'Measurement basics'
    ],
    '1st Grade': [
      'Addition/subtraction within 20', 'Place value (tens and ones)', 'Time telling', 'Measurement comparison', 'Basic fractions (halves)'
    ],
    '2nd Grade': [
      'Addition/subtraction within 100', 'Place value to 1000', 'Money concepts', 'Measurement with units', 'Fractions (halves, thirds, fourths)'
    ],
    '3rd Grade': [
      'Multiplication and division', 'Fractions concepts', 'Area and perimeter', 'Graphs and data', 'Multi-step problems'
    ],
    '4th Grade': [
      'Multi-digit multiplication/division', 'Fraction operations', 'Decimals introduction', 'Angles and geometry', 'Data representation'
    ],
    '5th Grade': [
      'Fraction and decimal operations', 'Volume concepts', 'Graph plotting', 'Order of operations', 'Problem solving strategies'
    ],
    '6th Grade': [
      'Ratios and proportions', 'Integer operations', 'Variables and expressions', 'Statistical analysis', 'Geometry concepts'
    ],
    '7th Grade': [
      'Proportional relationships', 'Rational numbers', 'Algebraic expressions', 'Probability concepts', 'Geometric constructions'
    ],
    '8th Grade': [
      'Linear equations', 'Functions introduction', 'Pythagorean theorem', 'Volume and surface area', 'Bivariate data'
    ],
    '9th Grade': [
      'Algebra fundamentals', 'Linear equations and inequalities', 'Function analysis', 'Coordinate geometry', 'Statistical methods'
    ],
    '10th Grade': [
      'Quadratic equations', 'Polynomial functions', 'Geometric proofs', 'Trigonometry introduction', 'Probability and statistics'
    ],
    '11th Grade': [
      'Advanced functions', 'Trigonometry applications', 'Analytical geometry', 'Sequences and series', 'Statistical inference'
    ],
    '12th Grade': [
      'Calculus concepts', 'Advanced algebra', 'Vector geometry', 'Statistical analysis', 'Mathematical modeling'
    ]
  },
  'Science': {
    'Pre-K': [
      'Sensory exploration', 'Weather watching', 'Plant growth', 'Animal characteristics', 'Simple experiments'
    ],
    'Kindergarten': [
      'Five senses', 'Weather patterns', 'Living vs. Non-living', 'Day and night cycle', 'Material properties'
    ],
    '1st Grade': [
      'Plant and animal needs', 'Seasonal changes', 'States of matter', 'Sun, moon, and stars', 'Sound and light'
    ],
    '2nd Grade': [
      'Life cycles', 'Habitats and ecosystems', 'Matter changes', 'Weather measurement', 'Force and motion'
    ],
    '3rd Grade': [
      'Plant and animal adaptations', 'Energy forms', 'Earth materials', 'Weather and climate', 'Simple machines'
    ],
    '4th Grade': [
      'Food chains and webs', 'Electricity and magnetism', 'Earth processes', 'Solar system', 'Scientific method'
    ],
    '5th Grade': [
      'Ecosystems and biomes', 'Matter and chemical changes', 'Earth\'s systems', 'Space exploration', 'Design and engineering'
    ],
    '6th Grade': [
      'Cells and body systems', 'Chemistry fundamentals', 'Earth\'s history', 'Weather systems', 'Engineering challenges'
    ],
    '7th Grade': [
      'Life science', 'Chemical reactions', 'Plate tectonics', 'Astronomy', 'Energy resources'
    ],
    '8th Grade': [
      'Genetics and heredity', 'Physics of motion', 'Earth\'s changing surface', 'Climate science', 'Waves and radiation'
    ],
    '9th Grade': [
      'Biology fundamentals', 'Chemistry principles', 'Earth science systems', 'Physics mechanics', 'Scientific research methods'
    ],
    '10th Grade': [
      'Cell biology and biochemistry', 'Chemical bonding', 'Earth systems and resources', 'Energy and thermodynamics', 'Laboratory techniques'
    ],
    '11th Grade': [
      'Anatomy and physiology', 'Organic chemistry', 'Environmental science', 'Mechanics and waves', 'Research design'
    ],
    '12th Grade': [
      'Molecular biology', 'Advanced chemistry', 'Geology and astronomy', 'Physics with calculus', 'Scientific investigation'
    ]
  },
  'Reading': {
    'Pre-K': [
      'Letter recognition', 'Phonological awareness', 'Book handling', 'Picture "reading"', 'Storytelling'
    ],
    'Kindergarten': [
      'Letter-sound relationships', 'Sight words', 'Simple text reading', 'Story elements', 'Reading comprehension basics'
    ],
    '1st Grade': [
      'Phonics patterns', 'Fluency development', 'Story structure', 'Fiction and nonfiction', 'Reading strategies'
    ],
    '2nd Grade': [
      'Reading fluency', 'Vocabulary building', 'Comprehension strategies', 'Author\'s purpose', 'Literary elements'
    ],
    '3rd Grade': [
      'Chapter books', 'Reading for information', 'Character analysis', 'Literary devices', 'Research skills'
    ],
    '4th Grade': [
      'Genre studies', 'Text features', 'Main idea and details', 'Inferencing', 'Literary analysis'
    ],
    '5th Grade': [
      'Complex texts', 'Critical reading', 'Theme identification', 'Author\'s craft', 'Research projects'
    ],
    '6th Grade': [
      'Literary analysis', 'Text structures', 'Argumentative texts', 'Digital literacy', 'Research methods'
    ],
    '7th Grade': [
      'Complex text analysis', 'Literary criticism', 'Informational text structures', 'Research and citation', 'Media literacy'
    ],
    '8th Grade': [
      'Textual evidence', 'Theme development', 'Comparative analysis', 'Document-based research', 'Critical perspectives'
    ],
    '9th Grade': [
      'Literary genres', 'Analysis of complex texts', 'Rhetorical strategies', 'Research methodologies', 'Critical reading skills'
    ],
    '10th Grade': [
      'World literature', 'Rhetoric and persuasion', 'Literary movements', 'Research synthesis', 'Media analysis'
    ],
    '11th Grade': [
      'American literature', 'Advanced literary analysis', 'Critical theory introduction', 'Research paper development', 'Historical context'
    ],
    '12th Grade': [
      'British literature', 'Advanced literary theory', 'Comparative literature', 'Independent research', 'Contemporary criticism'
    ]
  },
  'Writing': {
    'Pre-K': [
      'Scribbling with purpose', 'Drawing to tell stories', 'Name writing', 'Letter formation introduction', 'Dictating stories'
    ],
    'Kindergarten': [
      'Letter formation', 'Simple sentence writing', 'Drawing and writing connection', 'Labeling pictures', 'Journal writing'
    ],
    '1st Grade': [
      'Sentence structure', 'Narrative writing', 'Informative writing', 'Opinion writing', 'Editing basics'
    ],
    '2nd Grade': [
      'Paragraph writing', 'Story development', 'Informational reports', 'Persuasive writing', 'Revision strategies'
    ],
    '3rd Grade': [
      'Multi-paragraph writing', 'Creative writing', 'Research reports', 'Opinion essays', 'Editing and revising'
    ],
    '4th Grade': [
      'Writing process', 'Narrative techniques', 'Expository writing', 'Persuasive essays', 'Digital publishing'
    ],
    '5th Grade': [
      'Voice and style', 'Creative writing genres', 'Research papers', 'Argument writing', 'Multimedia presentations'
    ],
    '6th Grade': [
      'Essay structure', 'Creative writing', 'Argumentative writing', 'Research skills', 'Digital composition'
    ],
    '7th Grade': [
      'Advanced essay writing', 'Creative writing forms', 'Argumentative techniques', 'Research and citation', 'Writing for various audiences'
    ],
    '8th Grade': [
      'Thesis development', 'Literary analysis writing', 'Persuasive techniques', 'Research paper process', 'Digital storytelling'
    ],
    '9th Grade': [
      'Analytical essays', 'Narrative techniques', 'Argumentative writing', 'Research papers', 'Technical writing'
    ],
    '10th Grade': [
      'Literary analysis', 'Rhetorical techniques', 'Research methodology', 'Creative writing genres', 'Publication process'
    ],
    '11th Grade': [
      'Advanced essays', 'Critical analysis', 'Research synthesis', 'Creative writing portfolio', 'Professional writing'
    ],
    '12th Grade': [
      'College essays', 'Advanced literary analysis', 'Extended research projects', 'Creative writing specialization', 'Professional communications'
    ]
  },
  'Sports': {
    'Pre-K': [
      'Basic movement skills', 'Following directions in games', 'Ball skills introduction', 'Simple team games', 'Movement exploration'
    ],
    'Kindergarten': [
      'Locomotor movements', 'Ball handling skills', 'Simple game rules', 'Spatial awareness', 'Cooperative play'
    ],
    '1st Grade': [
      'Basic sports skills', 'Game rules and fair play', 'Movement patterns', 'Physical fitness basics', 'Team cooperation'
    ],
    '2nd Grade': [
      'Sports skill development', 'Game strategies', 'Movement combinations', 'Fitness concepts', 'Sportsmanship'
    ],
    '3rd Grade': [
      'Sport-specific skills', 'Basic offense/defense', 'Movement sequences', 'Fitness components', 'Game modifications'
    ],
    '4th Grade': [
      'Multiple sport skills', 'Game tactics', 'Movement concepts', 'Fitness assessment', 'Team dynamics'
    ],
    '5th Grade': [
      'Sport-specific techniques', 'Game strategy', 'Exercise physiology basics', 'Fitness planning', 'Leadership skills'
    ],
    '6th Grade': [
      'Individual/team sports', 'Strategic thinking', 'Physical training concepts', 'Health-related fitness', 'Competition principles'
    ],
    '7th Grade': [
      'Advanced sport skills', 'Sport-specific strategies', 'Training principles', 'Personal fitness plans', 'Coaching fundamentals'
    ],
    '8th Grade': [
      'Sport specialization', 'Advanced game strategy', 'Training program design', 'Fitness evaluation', 'Leadership in sports'
    ],
    '9th Grade': [
      'Performance techniques', 'Advanced game analysis', 'Training methodology', 'Fitness programming', 'Sports management'
    ],
    '10th Grade': [
      'Advanced sport systems', 'Performance analysis', 'Training periodization', 'Sport psychology basics', 'Officiating skills'
    ],
    '11th Grade': [
      'Elite performance skills', 'Game planning', 'Advanced training methods', 'Sports nutrition', 'Coaching strategies'
    ],
    '12th Grade': [
      'Specialized techniques', 'Advanced sport science', 'Leadership development', 'Career exploration', 'Athletic administration'
    ]
  },
  'Coding': {
    'Pre-K': [
      'Directional language', 'Pattern recognition', 'Simple sequencing', 'Block-based activities', 'Algorithmic thinking introduction'
    ],
    'Kindergarten': [
      'Coding unplugged activities', 'Visual block sequencing', 'Simple robot control', 'Directional commands', 'Pattern creation'
    ],
    '1st Grade': [
      'Block-based coding', 'Sequencing challenges', 'Simple debugging', 'Robot programming', 'Computational thinking'
    ],
    '2nd Grade': [
      'Block programming', 'Loops introduction', 'Problem decomposition', 'Animation creation', 'Digital storytelling'
    ],
    '3rd Grade': [
      'Events in coding', 'More complex sequences', 'Debugging strategies', 'Game design basics', 'Interactive stories'
    ],
    '4th Grade': [
      'Loops and conditionals', 'Variables introduction', 'Project planning', 'Game mechanics', 'Collaborative coding'
    ],
    '5th Grade': [
      'Functions introduction', 'Variables and data', 'Project development', 'Interactive games', 'Digital solutions'
    ],
    '6th Grade': [
      'Text-based coding intro', 'Programming concepts', 'App development basics', 'Game development', 'Physical computing'
    ],
    '7th Grade': [
      'Programming fundamentals', 'Data structures intro', 'Web development basics', 'Interactive media', 'Hardware interaction'
    ],
    '8th Grade': [
      'Multiple languages intro', 'Advanced programming concepts', 'Web development', 'Project management', 'Software design'
    ],
    '9th Grade': [
      'Python fundamentals', 'Data types and structures', 'Web development', 'Mobile app introduction', 'User interface design'
    ],
    '10th Grade': [
      'Advanced programming', 'Databases introduction', 'Web applications', 'Game development', 'Algorithm design'
    ],
    '11th Grade': [
      'Data science introduction', 'Full-stack development', 'Mobile applications', 'Advanced algorithms', 'Software development lifecycle'
    ],
    '12th Grade': [
      'Specialized programming', 'Software engineering principles', 'System architecture', 'Cybersecurity basics', 'Independent projects'
    ]
  },
  'Nature': {
    'Pre-K': [
      'Sensory exploration', 'Weather observation', 'Plant basics', 'Animal identification', 'Outdoor experiences'
    ],
    'Kindergarten': [
      'Seasonal changes', 'Animal characteristics', 'Plant life cycle basics', 'Weather patterns', 'Environmental awareness'
    ],
    '1st Grade': [
      'Plant and animal needs', 'Habitats introduction', 'Weather and seasons', 'Natural resources', 'Conservation basics'
    ],
    '2nd Grade': [
      'Life cycles', 'Habitats and adaptation', 'Water cycle', 'Natural resources', 'Environmental stewardship'
    ],
    '3rd Grade': [
      'Ecosystems basics', 'Plant and animal relationships', 'Geology introduction', 'Weather systems', 'Environmental issues'
    ],
    '4th Grade': [
      'Food webs', 'Animal adaptations', 'Earth materials', 'Natural disasters', 'Environmental impact'
    ],
    '5th Grade': [
      'Ecosystems and biomes', 'Plant and animal systems', 'Earth\'s resources', 'Weather and climate', 'Conservation projects'
    ],
    '6th Grade': [
      'Biomes in depth', 'Population dynamics', 'Earth systems', 'Climate factors', 'Environmental solutions'
    ],
    '7th Grade': [
      'Biodiversity', 'Human impact', 'Geological processes', 'Climate science', 'Sustainability concepts'
    ],
    '8th Grade': [
      'Ecological relationships', 'Environmental chemistry', 'Earth\'s systems interaction', 'Climate change', 'Sustainable practices'
    ],
    '9th Grade': [
      'Ecology principles', 'Biogeochemical cycles', 'Environmental science', 'Conservation biology', 'Sustainability challenges'
    ],
    '10th Grade': [
      'Ecosystem analysis', 'Environmental chemistry', 'Earth systems science', 'Climate change science', 'Resource management'
    ],
    '11th Grade': [
      'Advanced ecology', 'Environmental analysis', 'Earth science systems', 'Climate solutions', 'Sustainable design'
    ],
    '12th Grade': [
      'Conservation biology', 'Environmental policy', 'Earth systems dynamics', 'Climate action', 'Sustainable development'
    ]
  },
  'Animals': {
    'Pre-K': [
      'Animal sounds and movements', 'Pet care basics', 'Farm animals', 'Wild animals', 'Animal habitats introduction'
    ],
    'Kindergarten': [
      'Animal groups', 'Basic animal needs', 'Animal homes', 'Animal babies', 'Animal characteristics'
    ],
    '1st Grade': [
      'Animal classifications', 'Animal life cycles', 'Animal habitats', 'Animal adaptations', 'Human-animal relationships'
    ],
    '2nd Grade': [
      'Animal diversity', 'Habitat adaptations', 'Life cycles in depth', 'Animal behavior basics', 'Animal conservation'
    ],
    '3rd Grade': [
      'Animal classification systems', 'Adaptation and survival', 'Food chains', 'Animal behaviors', 'Endangered species'
    ],
    '4th Grade': [
      'Animal anatomy', 'Specialized adaptations', 'Ecosystems and animals', 'Animal communication', 'Wildlife conservation'
    ],
    '5th Grade': [
      'Animal systems', 'Adaptation and evolution', 'Food webs and energy', 'Animal behaviors and instincts', 'Conservation projects'
    ],
    '6th Grade': [
      'Animal physiology', 'Evolutionary adaptations', 'Population dynamics', 'Behavioral science', 'Conservation issues'
    ],
    '7th Grade': [
      'Comparative anatomy', 'Genetics basics', 'Ecological relationships', 'Advanced behavioral study', 'Conservation management'
    ],
    '8th Grade': [
      'Animal systems in depth', 'Evolutionary biology', 'Population ecology', 'Animal behavior studies', 'Wildlife management'
    ],
    '9th Grade': [
      'Zoology fundamentals', 'Genetics and heredity', 'Population dynamics', 'Behavioral ecology', 'Conservation biology'
    ],
    '10th Grade': [
      'Comparative physiology', 'Evolutionary principles', 'Population genetics', 'Ethology', 'Conservation strategies'
    ],
    '11th Grade': [
      'Advanced zoology', 'Evolutionary mechanisms', 'Community ecology', 'Advanced ethology', 'Conservation policy'
    ],
    '12th Grade': [
      'Specialized animal biology', 'Evolutionary biology', 'Conservation genetics', 'Animal cognition', 'Wildlife management'
    ]
  },
  'Space': {
    'Pre-K': [
      'Day and night', 'Moon observation', 'Star patterns', 'Rocket play', 'Space exploration introduction'
    ],
    'Kindergarten': [
      'Sun, moon, and stars', 'Day/night cycle', 'Planet introduction', 'Astronaut roles', 'Simple space concepts'
    ],
    '1st Grade': [
      'Solar system basics', 'Moon phases', 'Constellations', 'Space technology', 'Gravity introduction'
    ],
    '2nd Grade': [
      'Planets in depth', 'Earth\'s movement', 'Space travel history', 'Telescope basics', 'Space careers'
    ],
    '3rd Grade': [
      'Solar system details', 'Earth-moon system', 'Space exploration history', 'Astronomers and discoveries', 'Space technology'
    ],
    '4th Grade': [
      'Planetary science', 'Moon phases and eclipses', 'Space missions', 'Astronomical tools', 'Space phenomena'
    ],
    '5th Grade': [
      'Universe scale', 'Solar system mechanics', 'Space exploration technology', 'Stars and galaxies', 'Space physics basics'
    ],
    '6th Grade': [
      'Astronomy fundamentals', 'Planetary systems', 'Space exploration challenges', 'Stellar evolution', 'Space science careers'
    ],
    '7th Grade': [
      'Celestial mechanics', 'Planet formation', 'Advanced space technology', 'Galaxies and universe', 'Space physics'
    ],
    '8th Grade': [
      'Astrophysics introduction', 'Solar system dynamics', 'Space mission design', 'Cosmology basics', 'Future space exploration'
    ],
    '9th Grade': [
      'Astronomy principles', 'Gravitational physics', 'Space engineering', 'Stellar astronomy', 'Cosmology concepts'
    ],
    '10th Grade': [
      'Celestial mechanics', 'Planetary science', 'Space technology', 'Stellar evolution', 'Cosmological theories'
    ],
    '11th Grade': [
      'Astrophysics', 'Planetary geology', 'Space mission planning', 'Stellar dynamics', 'Contemporary cosmology'
    ],
    '12th Grade': [
      'Advanced astrophysics', 'Exoplanetary science', 'Space technology design', 'Advanced cosmology', 'Space research methods'
    ]
  },
  'Art': {
    'Pre-K': [
      'Color recognition and mixing', 'Basic shapes and lines', 'Finger painting', 'Texture exploration', 'Simple crafts'
    ],
    'Kindergarten': [
      'Primary and secondary colors', 'Drawing basics (shapes to pictures)', 'Cutting and pasting', 'Art with natural materials', 'Self-portrait basics'
    ],
    '1st Grade': [
      'Color theory (warm vs. cool)', 'Drawing people and animals', 'Basic printmaking', 'Clay modeling', 'Pattern creation'
    ],
    '2nd Grade': [
      'Painting techniques', 'Collage making', 'Symmetry in art', 'Observational drawing', 'Cultural art introduction'
    ],
    '3rd Grade': [
      'Mixed media art', 'Landscape drawing', 'Perspective introduction', 'Art history fundamentals', 'Weaving and textile arts'
    ],
    '4th Grade': [
      'Shading techniques', 'Watercolor painting', 'Sculpture basics', 'Digital art introduction', 'Art from different cultures'
    ],
    '5th Grade': [
      'Proportions in drawing', 'Acrylic painting', 'Printmaking techniques', 'Art history movements', '3D construction'
    ],
    '6th Grade': [
      'Observational drawing', 'Color theory advanced', 'Self-expression projects', 'Digital design basics', 'Art criticism introduction'
    ],
    '7th Grade': [
      'Perspective drawing', 'Portrait techniques', 'Ceramics', 'Art history periods', 'Visual storytelling'
    ],
    '8th Grade': [
      'Figure drawing', 'Oil pastel techniques', 'Mixed media composition', 'Public art and murals', 'Art criticism and analysis'
    ],
    '9th Grade': [
      'Elements of design', 'Acrylic painting techniques', 'Sculpture and installation', 'Art history chronology', 'Portfolio development'
    ],
    '10th Grade': [
      'Principles of design', 'Oil painting introduction', 'Advanced drawing techniques', 'Digital art and photography', 'Contemporary art movements'
    ],
    '11th Grade': [
      'Conceptual art', 'Personal style development', 'Advanced techniques in chosen medium', 'Art history research', 'Exhibition preparation'
    ],
    '12th Grade': [
      'Portfolio refinement', 'Independent projects', 'Art career exploration', 'Curatorial practice', 'Advanced art criticism'
    ]
  },
  'History': {
    'Pre-K': [
      'Family traditions', 'Community helpers', 'Basic timeline concepts', 'Cultural celebrations', 'Historical figures introduction'
    ],
    'Kindergarten': [
      'Personal timeline', 'School and community', 'National symbols', 'Cultural holidays', 'Historical stories'
    ],
    '1st Grade': [
      'Family history', 'Community history', 'American symbols and figures', 'Timeline basics', 'Comparing past and present'
    ],
    '2nd Grade': [
      'Community change over time', 'Biographies of historical figures', 'Map skills', 'Cultural traditions', 'Historical problem solving'
    ],
    '3rd Grade': [
      'Local community history', 'Native American cultures', 'Early explorers', 'Government basics', 'World cultures introduction'
    ],
    '4th Grade': [
      'State history', 'Regions of the United States', 'American Revolution', 'U.S. government', 'Immigration stories'
    ],
    '5th Grade': [
      'U.S. history survey', 'Colonial America', 'Constitution and democracy', 'Civil War', 'Industrial revolution'
    ],
    '6th Grade': [
      'Ancient civilizations', 'World geography', 'Cultural development', 'Early economic systems', 'Archaeological evidence'
    ],
    '7th Grade': [
      'Medieval and Renaissance periods', 'World religions', 'Exploration and colonization', 'Cultural diffusion', 'Historical research methods'
    ],
    '8th Grade': [
      'American history depth', 'Constitution and citizenship', 'Civil rights', 'Economic principles', 'Global connections'
    ],
    '9th Grade': [
      'World history survey', 'Ancient civilizations in depth', 'Cultural achievements', 'Global interactions', 'Historical inquiry'
    ],
    '10th Grade': [
      'Modern world history', 'Revolutions and conflicts', 'Industrialization', 'Imperialism and colonization', 'Global interdependence'
    ],
    '11th Grade': [
      'U.S. history in depth', 'Constitutional principles', 'Foreign policy', 'Economic development', 'Social movements'
    ],
    '12th Grade': [
      'Government and economics', 'Contemporary global issues', 'Comparative political systems', 'Public policy analysis', 'Civic engagement'
    ]
  },
  'Biology': {
    'Pre-K': [
      'Living vs. non-living things', 'Plant parts basics', 'Animal identification', 'Human body parts', 'Life needs (food, water, air)'
    ],
    'Kindergarten': [
      'Plant life cycle basics', 'Animal groups (mammals, birds, etc.)', 'Human senses', 'Living things and their needs', 'Baby animals and growth'
    ],
    '1st Grade': [
      'Plant parts and functions', 'Animal classification', 'Human body systems introduction', 'Habitats and homes', 'Living/non-living characteristics'
    ],
    '2nd Grade': [
      'Plant and animal life cycles', 'Animal adaptations', 'Human body systems', 'Habitats and ecosystems', 'Healthy habits'
    ],
    '3rd Grade': [
      'Plant reproduction and growth', 'Animal adaptations and survival', 'Human body systems in depth', 'Food chains and webs', 'Ecosystems and biodiversity'
    ],
    '4th Grade': [
      'Plant responses to environment', 'Animal groups and characteristics', 'Human organ systems', 'Food webs and energy transfer', 'Ecosystems and environmental factors'
    ],
    '5th Grade': [
      'Plant cellular structures', 'Vertebrate and invertebrate animals', 'Human body systems and health', 'Ecosystems and biomes', 'Adaptation and natural selection'
    ],
    '6th Grade': [
      'Cell structure and function', 'Organism classification', 'Human body systems interaction', 'Genetics introduction', 'Ecosystems and populations'
    ],
    '7th Grade': [
      'Cell processes and division', 'Animal and plant diversity', 'Human body systems in depth', 'Heredity basics', 'Ecological relationships'
    ],
    '8th Grade': [
      'Cell theory and types', 'Comparative anatomy', 'Human body homeostasis', 'Genetics and heredity', 'Evolutionary evidence'
    ],
    '9th Grade': [
      'Cellular biology', 'Biological diversity', 'Human physiology', 'Mendelian genetics', 'Ecology fundamentals'
    ],
    '10th Grade': [
      'Cell metabolism', 'Comparative physiology', 'Human anatomy systems', 'Molecular genetics', 'Ecosystem dynamics'
    ],
    '11th Grade': [
      'Biochemistry of cells', 'Evolutionary biology', 'Advanced human systems', 'Genetic technology', 'Population ecology'
    ],
    '12th Grade': [
      'Molecular and cellular processes', 'Evolutionary mechanisms', 'Disease and immunity', 'Genetic engineering', 'Conservation biology'
    ]
  },
  'Chemistry': {
    'Pre-K': [
      'Color mixing exploration', 'Material properties (soft/hard)', 'Mixing substances', 'Water play (sink/float)', 'States of matter introduction'
    ],
    'Kindergarten': [
      'Basic states of matter', 'Simple mixtures and solutions', 'Material properties', 'Safe substance exploration', 'Melting and freezing basics'
    ],
    '1st Grade': [
      'Solids, liquids, and gases', 'Simple mixtures vs. solutions', 'Material properties testing', 'Changes in matter (heating/cooling)', 'Introduction to measurements'
    ],
    '2nd Grade': [
      'States of matter in detail', 'Mixing and separating materials', 'Physical vs. chemical changes', 'Measurement in science', 'Water properties'
    ],
    '3rd Grade': [
      'Matter composition', 'Properties of materials', 'Changes in matter', 'Basic mixtures and solutions', 'Introduction to atoms'
    ],
    '4th Grade': [
      'Physical and chemical changes', 'Properties of matter', 'Mixtures and solutions', 'Measurements and tools', 'Introduction to elements'
    ],
    '5th Grade': [
      'Elements and compounds', 'Mixtures and solutions', 'Chemical reactions basics', 'Properties of materials', 'States of matter and changes'
    ],
    '6th Grade': [
      'Atoms and molecules', 'Element properties', 'Chemical vs. physical changes', 'Introduction to periodic table', 'Acids and bases introduction'
    ],
    '7th Grade': [
      'Atomic structure', 'Periodic table organization', 'Chemical formulas', 'Chemical reactions', 'Solutions and concentrations'
    ],
    '8th Grade': [
      'Atomic theory', 'Chemical bonding basics', 'Chemical reactions and equations', 'Acids and bases', 'Energy in chemical reactions'
    ],
    '9th Grade': [
      'Atomic structure and theory', 'Periodic table trends', 'Chemical bonding', 'Stoichiometry introduction', 'Chemical reactions types'
    ],
    '10th Grade': [
      'Electron configuration', 'Chemical bonding types', 'Chemical reactions and equations', 'Stoichiometry', 'Gas laws'
    ],
    '11th Grade': [
      'Thermochemistry', 'Reaction rates and equilibrium', 'Acids, bases, and pH', 'Oxidation and reduction', 'Organic chemistry introduction'
    ],
    '12th Grade': [
      'Advanced equilibrium', 'Electrochemistry', 'Organic chemistry reactions', 'Nuclear chemistry', 'Biochemistry'
    ]
  },
  'Physics': {
    'Pre-K': [
      'Push and pull forces', 'Balance and motion', 'Light and shadows', 'Sound making', 'Simple machines exploration'
    ],
    'Kindergarten': [
      'Force and motion basics', 'Simple machines', 'Light and shadows', 'Sound vibrations', 'Magnet exploration'
    ],
    '1st Grade': [
      'Motion and speed', 'Gravity introduction', 'Light and shadows', 'Sound properties', 'Magnetism basics'
    ],
    '2nd Grade': [
      'Forces and movement', 'Simple machines', 'Light reflection', 'Sound transmission', 'Magnetic forces'
    ],
    '3rd Grade': [
      'Forces and motion', 'Work and simple machines', 'Light properties', 'Sound waves', 'Magnetic fields'
    ],
    '4th Grade': [
      'Motion and forces', 'Energy forms', 'Light behavior', 'Sound properties and travel', 'Electricity basics'
    ],
    '5th Grade': [
      'Newton\'s laws introduction', 'Energy transformation', 'Light and optics', 'Sound waves', 'Electrical circuits'
    ],
    '6th Grade': [
      'Forces and motion', 'Energy types and transfer', 'Wave properties', 'Electricity and circuits', 'Magnetism and electromagnetism'
    ],
    '7th Grade': [
      'Newton\'s laws of motion', 'Energy conservation', 'Wave behavior', 'Electrical circuits', 'Electromagnetic spectrum'
    ],
    '8th Grade': [
      'Motion and forces', 'Energy transformations', 'Waves and sound', 'Electricity and magnetism', 'Optics basics'
    ],
    '9th Grade': [
      'Kinematics', 'Dynamics and Newton\'s laws', 'Energy and work', 'Wave phenomena', 'Electric forces'
    ],
    '10th Grade': [
      'Motion in two dimensions', 'Forces and free-body diagrams', 'Energy and momentum', 'Wave behavior and sound', 'Electricity and circuits'
    ],
    '11th Grade': [
      'Advanced mechanics', 'Thermal physics', 'Wave phenomena', 'Electromagnetism', 'Modern physics introduction'
    ],
    '12th Grade': [
      'Classical mechanics', 'Thermodynamics', 'Waves and optics', 'Electromagnetism', 'Quantum physics introduction'
    ]
  },
  'Earth Science': {
    'Pre-K': [
      'Weather watching', 'Rock collection', 'Water exploration', 'Soil discovery', 'Day and night cycle'
    ],
    'Kindergarten': [
      'Weather patterns', 'Earth materials', 'Water in our world', 'Seasonal changes', 'Sky observations'
    ],
    '1st Grade': [
      'Weather and seasons', 'Rocks and soil', 'Water cycle basics', 'Earth\'s surfaces', 'Sun, moon, and stars'
    ],
    '2nd Grade': [
      'Weather measurement', 'Rock properties', 'Water cycle', 'Landforms', 'Earth\'s patterns'
    ],
    '3rd Grade': [
      'Weather and climate', 'Rocks and minerals', 'Water distribution', 'Landforms and maps', 'Earth\'s resources'
    ],
    '4th Grade': [
      'Weather systems', 'Rock cycle', 'Earth\'s water systems', 'Erosion and weathering', 'Natural resources'
    ],
    '5th Grade': [
      'Weather and climate patterns', 'Earth\'s structure', 'Water resources', 'Landform changes', 'Natural disasters'
    ],
    '6th Grade': [
      'Weather and climate factors', 'Earth\'s layers', 'Water distribution', 'Plate tectonics introduction', 'Natural resource management'
    ],
    '7th Grade': [
      'Atmospheric science', 'Minerals and rocks', 'Hydrosphere', 'Plate tectonics', 'Earth history'
    ],
    '8th Grade': [
      'Climate systems', 'Earth materials and processes', 'Ocean dynamics', 'Earth\'s changing surface', 'Geologic time'
    ],
    '9th Grade': [
      'Atmospheric systems', 'Earth materials and resources', 'Hydrologic cycle', 'Geologic processes', 'Earth history'
    ],
    '10th Grade': [
      'Climate science', 'Earth resources', 'Oceanography', 'Geologic principles', 'Environmental systems'
    ],
    '11th Grade': [
      'Atmospheric dynamics', 'Mineralogy and petrology', 'Hydrologic systems', 'Advanced plate tectonics', 'Environmental geology'
    ],
    '12th Grade': [
      'Advanced climate science', 'Earth resources and sustainability', 'Marine science', 'Structural geology', 'Earth systems analysis'
    ]
  },
  // Add other subjects with their grade-specific sub-interests here...
};

const CreateChildProfilePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [childName, setChildName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Kindergarten');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedSubInterests, setSelectedSubInterests] = useState([]);
  const [otherInterests, setOtherInterests] = useState('');
  
  // Handle interest selection
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
      // Also remove any sub-interests related to this interest
      setSelectedSubInterests(selectedSubInterests.filter(si => !si.startsWith(`${interest}:`)));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  
  // Handle sub-interest selection
  const toggleSubInterest = (interest, subInterest) => {
    const fullSubInterest = `${interest}:${subInterest}`;
    
    if (selectedSubInterests.includes(fullSubInterest)) {
      setSelectedSubInterests(selectedSubInterests.filter(si => si !== fullSubInterest));
    } else {
      setSelectedSubInterests([...selectedSubInterests, fullSubInterest]);
    }
  };
  
  // Get available sub-interests for a specific interest based on current grade
  const getSubInterests = (interest) => {
    if (!SUB_INTERESTS[interest] || !SUB_INTERESTS[interest][gradeLevel]) {
      return [];
    }
    return SUB_INTERESTS[interest][gradeLevel];
  };
  
  // Handle form submission
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    
    if (!childName.trim()) {
      toast.error('Please enter your child\'s name');
      return;
    }
    
    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format all interests: main interests, sub-interests, and custom interests
      const interests = [
        ...selectedInterests,
        ...selectedSubInterests.map(si => si.split(':')[1]), // Extract just the sub-interest name
        ...(otherInterests.trim() ? [otherInterests.trim()] : [])
      ];
      
      // Create profile data object
      const profileData = {
        name: childName,
        grade: gradeLevel,
        interests,
        mainInterests: selectedInterests,
        subInterests: selectedSubInterests,
        customInterests: otherInterests
      };
      
      // Check if user is logged in
      try {
        await axios.get(`${API_BASE_URL}/auth/check`, { withCredentials: true });
        
        // User is logged in, create profile
        const response = await axios.post(
          `${API_BASE_URL}/child-profiles`,
          profileData,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          toast.success('Child profile created successfully!');
          
          // Store the profile in session storage
          sessionStorage.setItem('currentProfile', JSON.stringify({
            ...profileData,
            id: response.data.childProfile.id
          }));
          
          // Navigate to curriculum search page
          navigate('/curriculum-search', { state: { profile: profileData } });
        }
      } catch (authError) {
        // User is not logged in, store in session storage and redirect to curriculum search
        
        // Save to session storage for retrieval after signup/login
        sessionStorage.setItem('pendingChildProfile', JSON.stringify(profileData));
        sessionStorage.setItem('currentProfile', JSON.stringify(profileData));
        
        // Navigate to curriculum search page
        navigate('/curriculum-search', { state: { profile: profileData } });
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-lg bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Your Child's Profile</h2>
        <p className="text-gray-300 mb-6 text-center">
          Tell us about your child so we can personalize their learning resources
        </p>
        
        <form onSubmit={handleCreateProfile}>
          {/* Child's Name */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Child's Name</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your child's name"
            />
          </div>
          
          {/* Grade Level */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Current Grade Level</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          {/* Main Interests */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              Main Interests (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INTERESTS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sub Interests - Now specific to the selected grade */}
          {selectedInterests.length > 0 && (
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                {gradeLevel} Specific Topics
              </label>
              
              {selectedInterests.map((interest) => {
                const subInterestsForGrade = getSubInterests(interest);
                if (subInterestsForGrade.length === 0) return null;
                
                return (
                  <div key={interest} className="mb-4">
                    <h4 className="text-white text-sm mb-2">{interest}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {subInterestsForGrade.map((subInterest) => (
                        <button
                          type="button"
                          key={`${interest}:${subInterest}`}
                          onClick={() => toggleSubInterest(interest, subInterest)}
                          className={`p-2 text-sm rounded-lg text-center transition-colors ${
                            selectedSubInterests.includes(`${interest}:${subInterest}`)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {subInterest}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Other Interests */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Other Interests or Needs (Optional)
            </label>
            <textarea
              value={otherInterests}
              onChange={(e) => setOtherInterests(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tell us about any other interests, learning styles, or special needs..."
              rows={4}
            />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Cancel
            </button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
              font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChildProfilePage; 