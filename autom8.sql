-- phpMyAdmin SQL Dump
-- version 4.0.7
-- http://www.phpmyadmin.net
--
-- Vært: localhost
-- Genereringstid: 13. 04 2015 kl. 08:43:51
-- Serverversion: 5.6.14-log
-- PHP-version: 5.5.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `autom8`
--

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `builds`
--

CREATE TABLE IF NOT EXISTS `builds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `build` longtext NOT NULL,
  `error` longtext NOT NULL,
  `lastrun` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `hookrules`
--

CREATE TABLE IF NOT EXISTS `hookrules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hookid` int(11) NOT NULL,
  `type` varchar(32) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=85 ;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `hooks`
--

CREATE TABLE IF NOT EXISTS `hooks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hash` varchar(48) NOT NULL,
  `lasthit` timestamp NULL DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `buildid` int(11) DEFAULT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `logs`
--

CREATE TABLE IF NOT EXISTS `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hash` varchar(255) DEFAULT NULL,
  `build` longtext,
  `error` longtext,
  `build_error` longtext,
  `error_error` longtext,
  `status` varchar(32) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `requestid` int(11) NOT NULL,
  `buildid` int(11) NOT NULL,
  `hookid` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `requests`
--

CREATE TABLE IF NOT EXISTS `requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hookid` int(11) NOT NULL,
  `logid` int(11) DEFAULT NULL,
  `passed` tinyint(1) NOT NULL DEFAULT '0',
  `header` longtext NOT NULL,
  `body` longtext NOT NULL,
  `query` longtext NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=94 ;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(48) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
